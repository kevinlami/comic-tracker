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

@Injectable()
export class ReadingProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReadingProgressDto) {
    if (!dto || typeof dto.comicId !== 'string' || dto.comicId.trim().length === 0) {
      throw new BadRequestException('comicId is required and must not be empty');
    }

    if (
      dto.currentChapterId !== undefined &&
      dto.currentChapterId !== null &&
      typeof dto.currentChapterId !== 'string'
    ) {
      throw new BadRequestException('currentChapterId must be a string or null');
    }

    if (dto.status !== undefined && dto.status !== null) {
      if (typeof dto.status !== 'string' || !VALID_READING_STATUSES.has(dto.status as ReadingStatus)) {
        throw new BadRequestException(
          `Invalid status. Allowed values: ${Object.values(ReadingStatus).join(', ')}`,
        );
      }
    }

    const comic = await this.prisma.comic.findUnique({
      where: { id: dto.comicId },
    });
    if (!comic) {
      throw new NotFoundException(`Comic with id "${dto.comicId}" not found`);
    }

    if (dto.currentChapterId !== undefined && dto.currentChapterId !== null) {
      const chapter = await this.prisma.chapter.findUnique({
        where: { id: dto.currentChapterId },
      });
      if (!chapter) {
        throw new NotFoundException(`Chapter with id "${dto.currentChapterId}" not found`);
      }
    }

    try {
      return await this.prisma.readingProgress.create({
        data: {
          comicId: dto.comicId,
          currentChapterId: dto.currentChapterId,
          status: dto.status as ReadingStatus | undefined,
        },
        include: {
          comic: true,
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
      },
    });
  }

  async findOneByComicId(comicId: string) {
    const readingProgress = await this.prisma.readingProgress.findUnique({
      where: { comicId },
      include: {
        comic: true,
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

    if (dto.currentChapterId !== undefined && dto.currentChapterId !== null) {
      if (typeof dto.currentChapterId !== 'string') {
        throw new BadRequestException('currentChapterId must be a string or null');
      }
      const chapter = await this.prisma.chapter.findUnique({
        where: { id: dto.currentChapterId },
      });
      if (!chapter) {
        throw new NotFoundException(`Chapter with id "${dto.currentChapterId}" not found`);
      }
    }

    if (dto.status !== undefined && dto.status !== null) {
      if (typeof dto.status !== 'string' || !VALID_READING_STATUSES.has(dto.status as ReadingStatus)) {
        throw new BadRequestException(
          `Invalid status. Allowed values: ${Object.values(ReadingStatus).join(', ')}`,
        );
      }
    }

    const data: Record<string, unknown> = {};

    if (dto.currentChapterId !== undefined) {
      data.currentChapterId = dto.currentChapterId;
    }
    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    try {
      return await this.prisma.readingProgress.update({
        where: { comicId },
        data,
        include: {
          comic: true,
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
