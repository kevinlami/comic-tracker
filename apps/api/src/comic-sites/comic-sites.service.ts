import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComicSiteDto } from './dto/create-comic-site.dto';
import { UpdateComicSiteDto } from './dto/update-comic-site.dto';

@Injectable()
export class ComicSitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateComicSiteDto) {
    if (!dto || typeof dto.comicId !== 'string' || dto.comicId.trim().length === 0) {
      throw new BadRequestException('comicId is required and must not be empty');
    }

    if (typeof dto.siteId !== 'string' || dto.siteId.trim().length === 0) {
      throw new BadRequestException('siteId is required and must not be empty');
    }

    if (typeof dto.url !== 'string' || dto.url.trim().length === 0) {
      throw new BadRequestException('url is required and must not be empty');
    }

    const comic = await this.prisma.comic.findUnique({
      where: { id: dto.comicId },
    });
    if (!comic) {
      throw new NotFoundException(`Comic with id "${dto.comicId}" not found`);
    }

    const site = await this.prisma.site.findUnique({
      where: { id: dto.siteId },
    });
    if (!site) {
      throw new NotFoundException(`Site with id "${dto.siteId}" not found`);
    }

    try {
      return await this.prisma.comicSite.create({
        data: {
          comicId: dto.comicId,
          siteId: dto.siteId,
          url: dto.url.trim(),
        },
        include: {
          comic: true,
          site: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          `A ComicSite with comicId "${dto.comicId}" and siteId "${dto.siteId}" already exists`,
        );
      }
      throw error;
    }
  }

  /**
   * Lista os vínculos, com filtro opcional por site (`?siteId=`).
   *
   * O quadrinho volta com o progresso de leitura aninhado — é o que a
   * tela de detalhe do site exibe (status, capítulo e "lido há X").
   * Com `siteId`, a existência do site é validada antes (404).
   */
  async findAll(siteId?: string) {
    let filter: { siteId: string } | undefined;

    if (siteId !== undefined) {
      if (typeof siteId !== 'string' || siteId.trim().length === 0) {
        throw new BadRequestException('siteId must be a non-empty string');
      }

      const normalizedSiteId = siteId.trim();
      const site = await this.prisma.site.findUnique({
        where: { id: normalizedSiteId },
      });
      if (!site) {
        throw new NotFoundException(
          `Site with id "${normalizedSiteId}" not found`,
        );
      }

      filter = { siteId: normalizedSiteId };
    }

    return this.prisma.comicSite.findMany({
      where: filter,
      include: {
        comic: { include: { readingProgress: true } },
        site: true,
      },
    });
  }

  async findOne(id: string) {
    const comicSite = await this.prisma.comicSite.findUnique({
      where: { id },
      include: {
        comic: true,
        site: true,
      },
    });

    if (!comicSite) {
      throw new NotFoundException(`ComicSite with id "${id}" not found`);
    }

    return comicSite;
  }

  async update(id: string, dto: UpdateComicSiteDto) {
    await this.findOne(id);

    if (dto.comicId !== undefined) {
      if (typeof dto.comicId !== 'string' || dto.comicId.trim().length === 0) {
        throw new BadRequestException('comicId must be a non-empty string');
      }
      const comic = await this.prisma.comic.findUnique({
        where: { id: dto.comicId },
      });
      if (!comic) {
        throw new NotFoundException(`Comic with id "${dto.comicId}" not found`);
      }
    }

    if (dto.siteId !== undefined) {
      if (typeof dto.siteId !== 'string' || dto.siteId.trim().length === 0) {
        throw new BadRequestException('siteId must be a non-empty string');
      }
      const site = await this.prisma.site.findUnique({
        where: { id: dto.siteId },
      });
      if (!site) {
        throw new NotFoundException(`Site with id "${dto.siteId}" not found`);
      }
    }

    if (dto.url !== undefined) {
      if (typeof dto.url !== 'string' || dto.url.trim().length === 0) {
        throw new BadRequestException('url must be a non-empty string');
      }
    }

    const data: Record<string, unknown> = {};

    if (dto.comicId !== undefined) {
      data.comicId = dto.comicId;
    }
    if (dto.siteId !== undefined) {
      data.siteId = dto.siteId;
    }
    if (dto.url !== undefined) {
      data.url = dto.url.trim();
    }

    try {
      return await this.prisma.comicSite.update({
        where: { id },
        data,
        include: {
          comic: true,
          site: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          `A ComicSite with the given comicId and siteId already exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.comicSite.delete({ where: { id } });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new NotFoundException(`ComicSite with id "${id}" not found`);
      }
      throw error;
    }
  }
}
