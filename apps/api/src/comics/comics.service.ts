import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { ListComicsQueryDto } from './dto/list-comics.query.dto';
import { ComicType, ComicStatus, ReadingStatus } from '../generated/enums';
import { validateReadingStatus } from '../common/reading-status';

const VALID_COMIC_TYPES = new Set(Object.values(ComicType));
const VALID_COMIC_STATUSES = new Set(Object.values(ComicStatus));

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

    return this.prisma.comic.create({
      data: {
        title: dto.title.trim(),
        alternativeTitles: dto.alternativeTitles ?? [],
        type: dto.type,
        status: dto.status,
        coverUrl: dto.coverUrl,
      },
    });
  }

  /**
   * Lista quadrinhos com filtros opcionais para o dashboard.
   *
   * - `search`: busca case-insensitive no título;
   * - `status`: filtra pelo status de leitura do progresso.
   *
   * Sem paginação: o acervo é pessoal e cabe em memória.
   */
  async findAll(query?: ListComicsQueryDto) {
    const search =
      typeof query?.search === 'string' ? query.search.trim() : '';
    const status =
      typeof query?.status === 'string' && query.status.trim().length > 0
        ? query.status.trim()
        : undefined;

    validateReadingStatus(status);

    return this.prisma.comic.findMany({
      where: {
        ...(search.length > 0
          ? { title: { contains: search, mode: 'insensitive' } }
          : {}),
        ...(status !== undefined
          ? { readingProgress: { status: status as ReadingStatus } }
          : {}),
      },
      orderBy: {
        title: 'asc',
      },
      include: {
        readingProgress: {
          include: { comicSite: { include: { site: true } } },
        },
      },
    });
  }

  async findOne(id: string) {
    const comic = await this.prisma.comic.findUnique({ where: { id } });

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
