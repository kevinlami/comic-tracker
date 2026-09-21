import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSiteDto) {
    if (!dto || typeof dto.name !== 'string' || dto.name.trim().length === 0) {
      throw new BadRequestException('name is required and must not be empty');
    }

    if (
      typeof dto.baseUrl !== 'string' ||
      dto.baseUrl.trim().length === 0
    ) {
      throw new BadRequestException(
        'baseUrl is required and must not be empty',
      );
    }

    if (dto.isActive !== undefined && typeof dto.isActive !== 'boolean') {
      throw new BadRequestException('isActive must be a boolean');
    }

    try {
      return await this.prisma.site.create({
        data: {
          name: dto.name.trim(),
          baseUrl: dto.baseUrl.trim(),
          isActive: dto.isActive,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(`A site with name "${dto.name.trim()}" already exists`);
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.site.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });

    if (!site) {
      throw new NotFoundException(`Site with id "${id}" not found`);
    }

    return site;
  }

  async update(id: string, dto: UpdateSiteDto) {
    await this.findOne(id);

    if (dto.name !== undefined) {
      if (typeof dto.name !== 'string' || dto.name.trim().length === 0) {
        throw new BadRequestException('name must be a non-empty string');
      }
    }

    if (dto.baseUrl !== undefined) {
      if (typeof dto.baseUrl !== 'string' || dto.baseUrl.trim().length === 0) {
        throw new BadRequestException('baseUrl must be a non-empty string');
      }
    }

    if (dto.isActive !== undefined && typeof dto.isActive !== 'boolean') {
      throw new BadRequestException('isActive must be a boolean');
    }

    const data: Record<string, unknown> = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.baseUrl !== undefined) {
      data.baseUrl = dto.baseUrl.trim();
    }
    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    try {
      return await this.prisma.site.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          `A site with name "${dto.name?.trim()}" already exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.site.delete({ where: { id } });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new NotFoundException(`Site with id "${id}" not found`);
      }
      throw error;
    }
  }
}
