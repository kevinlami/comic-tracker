import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { ListComicsQueryDto } from './dto/list-comics.query.dto';
import { ComicType, ComicStatus, ReadingStatus } from '../generated/enums';
import { Prisma } from '../generated/client';
import { validateReadingStatus } from '../common/reading-status';

const VALID_COMIC_TYPES = new Set(Object.values(ComicType));
const VALID_COMIC_STATUSES = new Set(Object.values(ComicStatus));

/** Valores aceitos pelos filtros opcionais de `GET /comics`. */
const VALID_RATING_FILTERS = new Set(['1', '2', '3', '4', '5', 'none']);
const VALID_INACTIVE_FILTERS = new Set([
  'recent',
  '1w',
  '2w',
  '1m',
  'never',
]);
const VALID_SITE_STATUS_FILTERS = new Set(['active', 'inactive']);

const DAY_MS = 24 * 60 * 60 * 1000;
/** "Lido esta semana": leituras dos últimos 7 dias. */
const RECENT_DAYS = 7;
/** Dias sem leitura dos filtros "Parado há +X". */
const INACTIVE_DAYS: Record<string, number> = { '1w': 7, '2w': 14, '1m': 30 };

/** Condição do filtro de nota (`none` = obra ainda não avaliada). */
function ratingFilterWhere(rating: string): { rating: number | null } {
  return { rating: rating === 'none' ? null : Number(rating) };
}

/** Condição do filtro de site (`none` = obra sem nenhum vínculo). */
function siteFilterWhere(site: string) {
  return site === 'none'
    ? { sites: { none: {} } }
    : { sites: { some: { siteId: site } } };
}

/**
 * Condição do filtro de situação dos sites vinculados (`active` = ≥1 site
 * ativo, `inactive` = ≥1 site desativado). Obras sem site não satisfazem
 * nenhum dos dois ramos, como definido para o toggle do acervo.
 */
function siteStatusFilterWhere(siteStatus: string) {
  return {
    sites: {
      some: { site: { isActive: siteStatus === 'active' } },
    },
  };
}

/**
 * Condição aplicada ao progresso de leitura (status e/ou `lastReadAt`).
 * Usada quando o quadrinho precisa ter progresso registrado.
 */
type ProgressFilter = {
  status?: ReadingStatus;
  lastReadAt?: { gte?: Date; lte?: Date };
};

/**
 * Condição do filtro de período sem leitura sobre o progresso:
 * `recent` = leituras dos últimos 7 dias; os demais = parado há +X.
 * O filtro `never` é tratado fora, no nível do quadrinho.
 */
function inactiveProgressWhere(inactive: string): ProgressFilter {
  const sinceDays = (days: number) => new Date(Date.now() - days * DAY_MS);

  if (inactive === 'recent') {
    return { lastReadAt: { gte: sinceDays(RECENT_DAYS) } };
  }
  return { lastReadAt: { lte: sinceDays(INACTIVE_DAYS[inactive]) } };
}

/**
 * Condição de "Nunca lido": sem progresso ou sem data de última leitura —
 * em ambos os casos a obra nunca foi lida.
 */
const NEVER_READ_WHERE = {
  OR: [{ readingProgress: null }, { readingProgress: { lastReadAt: null } }],
};

/**
 * Avaliação pessoal do quadrinho: inteiro de 1 a 5, ou `null` quando o
 * usuário ainda não avaliou (campo opcional). Aceita `undefined` (campo
 * ausente no payload, que não altera o valor gravado).
 */
function validateRating(rating: unknown): void {
  if (rating === undefined || rating === null) {
    return;
  }

  if (
    typeof rating !== 'number' ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new BadRequestException(
      'rating must be an integer between 1 and 5 or null',
    );
  }
}

/**
 * Includes usados na leitura de um quadrinho (lista e detalhe):
 * progresso com o site usado na leitura e sites vinculados.
 */
const COMIC_INCLUDE = {
  readingProgress: {
    include: { comicSite: { include: { site: true } } },
  },
  sites: {
    include: { site: true },
  },
};

@Injectable()
export class ComicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateComicDto) {
    if (!dto || typeof dto.title !== 'string' || dto.title.trim().length === 0) {
      throw new BadRequestException('title is required and must not be empty');
    }

    if (dto.type && !VALID_COMIC_TYPES.has(dto.type)) {
      throw new BadRequestException(
        `Invalid type. Allowed values: ${Object.values(ComicType).join(', ')}`,
      );
    }

    if (dto.status && !VALID_COMIC_STATUSES.has(dto.status)) {
      throw new BadRequestException(
        `Invalid status. Allowed values: ${Object.values(ComicStatus).join(', ')}`,
      );
    }

    if (
      dto.alternativeTitles !== undefined &&
      (!Array.isArray(dto.alternativeTitles) ||
        dto.alternativeTitles.some((t) => typeof t !== 'string'))
    ) {
      throw new BadRequestException(
        'alternativeTitles must be an array of strings',
      );
    }

    if (
      dto.coverUrl !== undefined &&
      dto.coverUrl !== null &&
      typeof dto.coverUrl !== 'string'
    ) {
      throw new BadRequestException('coverUrl must be a string or null');
    }

    validateRating(dto.rating);

    return this.prisma.comic.create({
      data: {
        title: dto.title.trim(),
        alternativeTitles: dto.alternativeTitles ?? [],
        type: dto.type,
        status: dto.status,
        coverUrl: dto.coverUrl,
        rating: dto.rating,
      },
    });
  }

  /**
   * Lista quadrinhos com filtros opcionais para o dashboard.
   *
   * - `search`: busca case-insensitive no título;
   * - `status`: filtra pelo status de leitura do progresso (`PLAN_TO_READ`
   *   também inclui obras ainda sem progresso, ou seja, nunca iniciadas);
   * - `order`: `title` (padrão, A–Z) ou `recent` (cadastro mais recente);
   * - `rating`: nota exata (1–5) ou `none` para obras sem avaliação;
   * - `site`: id do site vinculado ou `none` para obras sem vínculo;
   * - `siteStatus`: `active` (≥1 site ativo) ou `inactive` (≥1 site
   *   desativado); obras sem site não satisfazem nenhum dos dois;
   * - `inactive`: período sem leitura (`recent`, `1w`, `2w`, `1m`, `never`).
   *
   * Os filtros combinam entre si (E lógico). Sem paginação: o acervo é
   * pessoal e cabe em memória.
   */
  async findAll(query?: ListComicsQueryDto) {
    const search =
      typeof query?.search === 'string' ? query.search.trim() : '';
    const status =
      typeof query?.status === 'string' && query.status.trim().length > 0
        ? query.status.trim()
        : undefined;
    const order =
      typeof query?.order === 'string' && query.order.trim().length > 0
        ? query.order.trim()
        : 'title';
    const rating =
      typeof query?.rating === 'string' && query.rating.trim().length > 0
        ? query.rating.trim()
        : undefined;
    const site =
      typeof query?.site === 'string' && query.site.trim().length > 0
        ? query.site.trim()
        : undefined;
    const siteStatus =
      typeof query?.siteStatus === 'string' && query.siteStatus.trim().length > 0
        ? query.siteStatus.trim()
        : undefined;
    const inactive =
      typeof query?.inactive === 'string' && query.inactive.trim().length > 0
        ? query.inactive.trim()
        : undefined;

    validateReadingStatus(status);

    if (order !== 'title' && order !== 'recent') {
      throw new BadRequestException(
        'Invalid order. Allowed values: title, recent',
      );
    }

    if (rating !== undefined && !VALID_RATING_FILTERS.has(rating)) {
      throw new BadRequestException(
        `Invalid rating filter. Allowed values: ${[
          ...VALID_RATING_FILTERS,
        ].join(', ')}`,
      );
    }

    if (inactive !== undefined && !VALID_INACTIVE_FILTERS.has(inactive)) {
      throw new BadRequestException(
        `Invalid inactive filter. Allowed values: ${[
          ...VALID_INACTIVE_FILTERS,
        ].join(', ')}`,
      );
    }

    if (
      siteStatus !== undefined &&
      !VALID_SITE_STATUS_FILTERS.has(siteStatus)
    ) {
      throw new BadRequestException(
        `Invalid siteStatus filter. Allowed values: ${[
          ...VALID_SITE_STATUS_FILTERS,
        ].join(', ')}`,
      );
    }

    // Status e período sem leitura compartilham o filtro de progresso:
    // combinados num único objeto para não se sobrescreverem.
    const progressWhere: ProgressFilter = {};
    if (status !== undefined) {
      progressWhere.status = status as ReadingStatus;
    }
    if (inactive !== undefined && inactive !== 'never') {
      Object.assign(progressWhere, inactiveProgressWhere(inactive));
    }

    // "Planejo ler" contempla também obras ainda sem progresso (nunca
    // iniciadas), como já faz o rótulo do card. O ramo sem progresso é
    // omitido em "lido esta semana", que exige leitura registrada.
    const includeNotStarted =
      status === 'PLAN_TO_READ' && inactive !== 'recent';

    // Condições que disputam chaves já ocupadas no `where` (`AND`) ou que
    // precisam ser combinadas com o filtro `site`, que usa a chave `sites`:
    // reunidas num único `AND` para não se sobrescreverem.
    const andConditions: Prisma.ComicWhereInput[] = [];
    if (includeNotStarted) {
      // O `AND` evita colidir com o `OR` do filtro "nunca lido".
      andConditions.push({
        OR: [
          { readingProgress: progressWhere },
          { readingProgress: null },
        ],
      });
    }
    if (siteStatus !== undefined) {
      andConditions.push(siteStatusFilterWhere(siteStatus));
    }

    return this.prisma.comic.findMany({
      where: {
        ...(search.length > 0
          ? { title: { contains: search, mode: 'insensitive' } }
          : {}),
        ...(inactive === 'never' ? NEVER_READ_WHERE : {}),
        ...(Object.keys(progressWhere).length > 0 && !includeNotStarted
          ? { readingProgress: progressWhere }
          : {}),
        ...(rating !== undefined ? ratingFilterWhere(rating) : {}),
        ...(site !== undefined ? siteFilterWhere(site) : {}),
        ...(andConditions.length > 0 ? { AND: andConditions } : {}),
      },
      orderBy: order === 'recent' ? { createdAt: 'desc' } : { title: 'asc' },
      include: COMIC_INCLUDE,
    });
  }

  async findOne(id: string) {
    const comic = await this.prisma.comic.findUnique({
      where: { id },
      include: COMIC_INCLUDE,
    });

    if (!comic) {
      throw new NotFoundException(`Comic with id "${id}" not found`);
    }

    return comic;
  }

  async update(id: string, dto: UpdateComicDto) {
    await this.findOne(id);

    if (dto.title !== undefined) {
      if (typeof dto.title !== 'string' || dto.title.trim().length === 0) {
        throw new BadRequestException('title must be a non-empty string');
      }
    }

    if (dto.type !== undefined && !VALID_COMIC_TYPES.has(dto.type)) {
      throw new BadRequestException(
        `Invalid type. Allowed values: ${Object.values(ComicType).join(', ')}`,
      );
    }

    if (dto.status !== undefined && !VALID_COMIC_STATUSES.has(dto.status)) {
      throw new BadRequestException(
        `Invalid status. Allowed values: ${Object.values(ComicStatus).join(', ')}`,
      );
    }

    if (
      dto.alternativeTitles !== undefined &&
      (!Array.isArray(dto.alternativeTitles) ||
        dto.alternativeTitles.some((t) => typeof t !== 'string'))
    ) {
      throw new BadRequestException(
        'alternativeTitles must be an array of strings',
      );
    }

    if (
      dto.coverUrl !== undefined &&
      dto.coverUrl !== null &&
      typeof dto.coverUrl !== 'string'
    ) {
      throw new BadRequestException('coverUrl must be a string or null');
    }

    validateRating(dto.rating);

    const data: Record<string, unknown> = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.alternativeTitles !== undefined) {
      data.alternativeTitles = dto.alternativeTitles;
    }
    if (dto.type !== undefined) {
      data.type = dto.type;
    }
    if (dto.status !== undefined) {
      data.status = dto.status;
    }
    if (dto.coverUrl !== undefined) {
      data.coverUrl = dto.coverUrl;
    }
    if (dto.rating !== undefined) {
      data.rating = dto.rating;
    }

    return this.prisma.comic.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    try {
      await this.prisma.comic.delete({ where: { id } });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new NotFoundException(`Comic with id "${id}" not found`);
      }
      throw error;
    }
  }
}
