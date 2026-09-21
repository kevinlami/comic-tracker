import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComicDto } from './dto/create-comic.dto';
import { ComicType, ComicStatus } from '../generated/enums';

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

  async findAll() {
    return this.prisma.comic.findMany({
      orderBy: {
        title: 'asc',
      },
    });
  }
}
