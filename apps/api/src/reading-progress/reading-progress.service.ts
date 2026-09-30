import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReadingProgressDto } from './dto/create-reading-progress.dto';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';
import { ReadingStatus } from '../generated/enums';

const VALID_READING_STATUSES = new Set(Object.values(ReadingStatus));

const CHAPTER_NUMBER_REGEX = /^-?\d+(\.\d{1,3})?$/;

type ChapterFields = {
  currentChapterNumber?: string | null;
  currentChapterUrl?: string | null;
  comicSiteId?: string | null;
};

@Injectable()
export class ReadingProgressService {
  constructor(private readonly prisma: PrismaService) {}

  private validateStatus(status: unknown): void {
    if (status === undefined || status === null) {
      return;
    }
    if (typeof status !== 'string' || !VALID_READING_STATUSES.has(status as ReadingStatus)) {
      throw new BadRequestException(
        `Invalid status. Allowed values: ${Object.values(ReadingStatus).join(', ')}`,
      );
    }
  }

  private validateChapterNumber(value: unknown): void {
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value !== 'string') {
      throw new BadRequestException('currentChapterNumber must be a string or null');
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new BadRequestException('currentChapterNumber must not be empty');
    }
    if (!CHAPTER_NUMBER_REGEX.test(trimmed)) {
      throw new BadRequestException(
        'currentChapterNumber must be a valid decimal with at most 3 decimal places',
      );
    }
  }

  private validateChapterUrl(value: unknown): void {
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value !== 'string') {
      throw new BadRequestException('currentChapterUrl must be a string or null');
    }
    if (value.trim().length === 0) {
      throw new BadRequestException('currentChapterUrl must not be empty');
    }
  }

  private validateComicSiteId(value: unknown): void {
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException('comicSiteId must be a non-empty string or null');
    }
  }

  private validateChapterFields(dto: ChapterFields): void {
    this.validateChapterNumber(dto.currentChapterNumber);
    this.validateChapterUrl(dto.currentChapterUrl);
    this.validateComicSiteId(dto.comicSiteId);
  }

  private async assertComicSiteBelongsToComic(
    comicSiteId: string,
    comicId: string,
  ): Promise<void> {
    const comicSite = await this.prisma.comicSite.findUnique({
      where: { id: comicSiteId },
    });
    if (!comicSite) {
      throw new NotFoundException(`ComicSite with id "${comicSiteId}" not found`);
    }
    if (comicSite.comicId !== comicId) {
      throw new BadRequestException(
        `ComicSite with id "${comicSiteId}" does not belong to Comic "${comicId}"`,
      );
    }
  }

  async create(dto: CreateReadingProgressDto) {
    if (!dto || typeof dto.comicId !== 'string' || dto.comicId.trim().length === 0) {
      throw new BadRequestException('comicId is required and must not be empty');
    }

    this.validateChapterFields(dto);
    this.validateStatus(dto.status);

    const comic = await this.prisma.comic.findUnique({
      where: { id: dto.comicId },
    });
    if (!comic) {
      throw new NotFoundException(`Comic with id "${dto.comicId}" not found`);
    }

    if (dto.comicSiteId !== undefined && dto.comicSiteId !== null) {
      await this.assertComicSiteBelongsToComic(dto.comicSiteId, dto.comicId);
    }

    const currentChapterNumber =
      typeof dto.currentChapterNumber === 'string'
        ? dto.currentChapterNumber.trim()
        : dto.currentChapterNumber;
    const currentChapterUrl =
      typeof dto.currentChapterUrl === 'string'
        ? dto.currentChapterUrl.trim()
        : dto.currentChapterUrl;
    const hasChapterInfo = currentChapterNumber != null || currentChapterUrl != null;

    try {
      return await this.prisma.readingProgress.create({
        data: {
          comicId: dto.comicId,
          currentChapterNumber,
          currentChapterUrl,
          comicSiteId: dto.comicSiteId,
          status: dto.status as ReadingStatus | undefined,
          lastReadAt: hasChapterInfo ? new Date() : null,
        },
        include: {
          comic: true,
          comicSite: { include: { site: true } },
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          `A ReadingProgress already exists for comicId "${dto.comicId}"`,
        );
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.readingProgress.findMany({
      orderBy: { comicId: 'asc' },
      include: {
        comic: true,
        comicSite: { include: { site: true } },
      },
    });
  }

  async findOneByComicId(comicId: string) {
    const readingProgress = await this.prisma.readingProgress.findUnique({
      where: { comicId },
      include: {
        comic: true,
        comicSite: { include: { site: true } },
      },
    });

    if (!readingProgress) {
      throw new NotFoundException(
        `ReadingProgress for comic with id "${comicId}" not found`,
      );
    }

    return readingProgress;
  }

  async update(comicId: string, dto: UpdateReadingProgressDto) {
    await this.findOneByComicId(comicId);

    this.validateChapterFields(dto);
    this.validateStatus(dto.status);

    if (dto.comicSiteId !== undefined && dto.comicSiteId !== null) {
      await this.assertComicSiteBelongsToComic(dto.comicSiteId, comicId);
    }

    const data: Record<string, unknown> = {};

    if (dto.currentChapterNumber !== undefined) {
      data.currentChapterNumber =
        typeof dto.currentChapterNumber === 'string'
          ? dto.currentChapterNumber.trim()
          : dto.currentChapterNumber;
    }
    if (dto.currentChapterUrl !== undefined) {
      data.currentChapterUrl =
        typeof dto.currentChapterUrl === 'string'
          ? dto.currentChapterUrl.trim()
          : dto.currentChapterUrl;
    }
    if (dto.comicSiteId !== undefined) {
      data.comicSiteId = dto.comicSiteId;
    }
    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    const chapterTouched =
      dto.currentChapterNumber !== undefined || dto.currentChapterUrl !== undefined;
    if (chapterTouched) {
      const bothCleared =
        dto.currentChapterNumber === null && dto.currentChapterUrl === null;
      const anyInformed =
        dto.currentChapterNumber != null || dto.currentChapterUrl != null;

      if (bothCleared) {
        data.lastReadAt = null;
      } else if (anyInformed) {
        data.lastReadAt = new Date();
      }
    }

    try {
      return await this.prisma.readingProgress.update({
        where: { comicId },
        data,
        include: {
          comic: true,
          comicSite: { include: { site: true } },
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          `A ReadingProgress already exists for comicId "${comicId}"`,
        );
      }
      throw error;
    }
  }

  /**
   * Cria ou atualiza o progresso em uma única operação.
   * É o ponto de entrada pensado para a futura extensão do navegador:
   * uma única requisição para registrar a última leitura.
   */
  async upsert(comicId: string, dto: UpdateReadingProgressDto) {
    const existing = await this.prisma.readingProgress.findUnique({
      where: { comicId },
    });

    if (existing) {
      return this.update(comicId, dto);
    }

    return this.create({
      comicId,
      currentChapterNumber: dto.currentChapterNumber,
      currentChapterUrl: dto.currentChapterUrl,
      comicSiteId: dto.comicSiteId,
      status: dto.status,
    });
  }

  async remove(comicId: string) {
    try {
      await this.prisma.readingProgress.delete({ where: { comicId } });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new NotFoundException(
          `ReadingProgress for comic with id "${comicId}" not found`,
        );
      }
      throw error;
    }
  }
}
