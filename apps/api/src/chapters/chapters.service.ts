import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

const DECIMAL_REGEX = /^-?\d+(\.\d{1,3})?$/;

function isValidDecimalString(value: string): boolean {
  return DECIMAL_REGEX.test(value);
}

@Injectable()
export class ChaptersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChapterDto) {
    if (!dto || typeof dto.comicSiteId !== 'string' || dto.comicSiteId.trim().length === 0) {
      throw new BadRequestException('comicSiteId is required and must not be empty');
    }

    if (typeof dto.number !== 'string' || dto.number.trim().length === 0) {
      throw new BadRequestException('number is required and must not be empty');
    }

    if (!isValidDecimalString(dto.number.trim())) {
      throw new BadRequestException(
        'number must be a valid decimal with at most 3 decimal places',
      );
    }

    if (typeof dto.url !== 'string' || dto.url.trim().length === 0) {
      throw new BadRequestException('url is required and must not be empty');
    }

    if (dto.title !== undefined && dto.title !== null && typeof dto.title !== 'string') {
      throw new BadRequestException('title must be a string or null');
    }

    if (
      dto.publishedAt !== undefined &&
      dto.publishedAt !== null &&
      !(dto.publishedAt instanceof Date)
    ) {
      throw new BadRequestException('publishedAt must be a Date or null');
    }

    const comicSite = await this.prisma.comicSite.findUnique({
      where: { id: dto.comicSiteId },
    });
    if (!comicSite) {
      throw new NotFoundException(`ComicSite with id "${dto.comicSiteId}" not found`);
    }

    try {
      return await this.prisma.chapter.create({
        data: {
          comicSiteId: dto.comicSiteId,
          number: dto.number.trim(),
          title: dto.title,
          url: dto.url.trim(),
          publishedAt: dto.publishedAt,
        },
        include: {
          comicSite: {
            include: {
              comic: true,
              site: true,
            },
          },
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          `A Chapter with number "${dto.number}" already exists for this ComicSite`,
        );
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.chapter.findMany({
      orderBy: [{ comicSiteId: 'asc' }, { number: 'asc' }],
      include: {
        comicSite: {
          include: {
            comic: true,
            site: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: {
        comicSite: {
          include: {
            comic: true,
            site: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with id "${id}" not found`);
    }

    return chapter;
  }

  async update(id: string, dto: UpdateChapterDto) {
    await this.findOne(id);

    if (dto.comicSiteId !== undefined) {
      if (typeof dto.comicSiteId !== 'string' || dto.comicSiteId.trim().length === 0) {
        throw new BadRequestException('comicSiteId must be a non-empty string');
      }
      const comicSite = await this.prisma.comicSite.findUnique({
        where: { id: dto.comicSiteId },
      });
      if (!comicSite) {
        throw new NotFoundException(`ComicSite with id "${dto.comicSiteId}" not found`);
      }
    }

    if (dto.number !== undefined) {
      if (typeof dto.number !== 'string' || dto.number.trim().length === 0) {
        throw new BadRequestException('number must be a non-empty string');
      }
      if (!isValidDecimalString(dto.number.trim())) {
        throw new BadRequestException(
          'number must be a valid decimal with at most 3 decimal places',
        );
      }
    }

    if (dto.url !== undefined) {
      if (typeof dto.url !== 'string' || dto.url.trim().length === 0) {
        throw new BadRequestException('url must be a non-empty string');
      }
    }

    if (dto.title !== undefined && dto.title !== null && typeof dto.title !== 'string') {
      throw new BadRequestException('title must be a string or null');
    }

    if (
      dto.publishedAt !== undefined &&
      dto.publishedAt !== null &&
      !(dto.publishedAt instanceof Date)
    ) {
      throw new BadRequestException('publishedAt must be a Date or null');
    }

    const data: Record<string, unknown> = {};

    if (dto.comicSiteId !== undefined) {
      data.comicSiteId = dto.comicSiteId;
    }
    if (dto.number !== undefined) {
      data.number = dto.number.trim();
    }
    if (dto.title !== undefined) {
      data.title = dto.title;
    }
    if (dto.url !== undefined) {
      data.url = dto.url.trim();
    }
    if (dto.publishedAt !== undefined) {
      data.publishedAt = dto.publishedAt;
    }

    try {
      return await this.prisma.chapter.update({
        where: { id },
        data,
        include: {
          comicSite: {
            include: {
              comic: true,
              site: true,
            },
          },
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          `A Chapter with the given number already exists for this ComicSite`,
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.chapter.delete({ where: { id } });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new NotFoundException(`Chapter with id "${id}" not found`);
      }
      throw error;
    }
  }
}
