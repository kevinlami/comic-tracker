import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SitesService } from './sites.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SitesService', () => {
  let service: SitesService;
  let prisma: {
    site: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      site: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SitesService>(SitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a site with required fields', async () => {
      const dto = { name: 'MangaPlus', baseUrl: 'https://mangaplus.shueisha.co.jp' };
      const expected = {
        id: 'uuid-1',
        name: 'MangaPlus',
        baseUrl: 'https://mangaplus.shueisha.co.jp',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.site.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(prisma.site.create).toHaveBeenCalledWith({
        data: {
          name: 'MangaPlus',
          baseUrl: 'https://mangaplus.shueisha.co.jp',
          isActive: undefined,
        },
      });
      expect(result).toEqual(expected);
    });

    it('should create a site with isActive false', async () => {
      const dto = {
        name: 'MangaPlus',
        baseUrl: 'https://mangaplus.shueisha.co.jp',
        isActive: false,
      };
      const expected = { id: 'uuid-1', ...dto, isActive: false, createdAt: new Date(), updatedAt: new Date() };

      prisma.site.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(prisma.site.create).toHaveBeenCalledWith({
        data: {
          name: 'MangaPlus',
          baseUrl: 'https://mangaplus.shueisha.co.jp',
          isActive: false,
        },
      });
      expect(result).toEqual(expected);
    });

    it('should trim name and baseUrl', async () => {
      const dto = { name: '  MangaPlus  ', baseUrl: '  https://example.com  ' };
      prisma.site.create.mockResolvedValue({ id: '1', name: 'MangaPlus', baseUrl: 'https://example.com' });

      await service.create(dto);

      expect(prisma.site.create).toHaveBeenCalledWith({
        data: {
          name: 'MangaPlus',
          baseUrl: 'https://example.com',
          isActive: undefined,
        },
      });
    });

    it('should throw BadRequestException when dto is undefined', async () => {
      try {
        await service.create(undefined as unknown as { name: string; baseUrl: string });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when name is empty', async () => {
      try {
        await service.create({ name: '', baseUrl: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when name is only whitespace', async () => {
      try {
        await service.create({ name: '   ', baseUrl: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when baseUrl is empty', async () => {
      try {
        await service.create({ name: 'Test', baseUrl: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when baseUrl is only whitespace', async () => {
      try {
        await service.create({ name: 'Test', baseUrl: '   ' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when isActive is not boolean', async () => {
      try {
        await service.create({
          name: 'Test',
          baseUrl: 'https://example.com',
          isActive: 'yes' as unknown as boolean,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw ConflictException for duplicate name', async () => {
      const prismaError = Object.assign(new Error('Unique constraint failed'), {
        code: 'P2002',
        clientVersion: '7.0.0',
        meta: { target: ['name'] },
      });
      prisma.site.create.mockRejectedValue(prismaError);

      try {
        await service.create({ name: 'MangaPlus', baseUrl: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should rethrow non-P2002 errors', async () => {
      const dbError = Object.assign(new Error('Connection refused'), {
        code: 'P1001',
        clientVersion: '7.0.0',
      });
      prisma.site.create.mockRejectedValue(dbError);

      try {
        await service.create({ name: 'Test', baseUrl: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection refused');
      }
    });
  });

  describe('findAll', () => {
    it('should return an empty array when no sites exist', async () => {
      prisma.site.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(prisma.site.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should return sites ordered by name', async () => {
      const sites = [
        { id: '1', name: 'MangaPlus' },
        { id: '2', name: 'Viz' },
      ];
      prisma.site.findMany.mockResolvedValue(sites);

      const result = await service.findAll();

      expect(result).toEqual(sites);
    });
  });

  describe('findOne', () => {
    it('should return a site when found', async () => {
      const site = {
        id: 'uuid-1',
        name: 'MangaPlus',
        baseUrl: 'https://mangaplus.shueisha.co.jp',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.site.findUnique.mockResolvedValue(site);

      const result = await service.findOne('uuid-1');

      expect(prisma.site.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(site);
    });

    it('should throw NotFoundException when site is not found', async () => {
      prisma.site.findUnique.mockResolvedValue(null);

      try {
        await service.findOne('nonexistent-id');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
      expect(prisma.site.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
    });
  });

  describe('update', () => {
    const existingSite = {
      id: 'uuid-1',
      name: 'MangaPlus',
      baseUrl: 'https://mangaplus.shueisha.co.jp',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      prisma.site.findUnique.mockResolvedValue(existingSite);
    });

    it('should update only name', async () => {
      const updated = { ...existingSite, name: 'New Name' };
      prisma.site.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { name: 'New Name' });

      expect(prisma.site.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { name: 'New Name' },
      });
      expect(result).toEqual(updated);
    });

    it('should update only baseUrl', async () => {
      const updated = { ...existingSite, baseUrl: 'https://new-url.com' };
      prisma.site.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', {
        baseUrl: 'https://new-url.com',
      });

      expect(prisma.site.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { baseUrl: 'https://new-url.com' },
      });
      expect(result).toEqual(updated);
    });

    it('should update only isActive', async () => {
      const updated = { ...existingSite, isActive: false };
      prisma.site.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { isActive: false });

      expect(prisma.site.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { isActive: false },
      });
      expect(result).toEqual(updated);
    });

    it('should update multiple fields at once', async () => {
      const updated = {
        ...existingSite,
        name: 'New Name',
        baseUrl: 'https://new-url.com',
        isActive: false,
      };
      prisma.site.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', {
        name: 'New Name',
        baseUrl: 'https://new-url.com',
        isActive: false,
      });

      expect(prisma.site.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: {
          name: 'New Name',
          baseUrl: 'https://new-url.com',
          isActive: false,
        },
      });
      expect(result).toEqual(updated);
    });

    it('should not send omitted fields to prisma update', async () => {
      prisma.site.update.mockResolvedValue(existingSite);

      await service.update('uuid-1', { name: 'New Name' });

      const callData = prisma.site.update.mock.calls[0][0].data;
      expect(Object.keys(callData)).toEqual(['name']);
    });

    it('should trim name and baseUrl when updating', async () => {
      prisma.site.update.mockResolvedValue(existingSite);

      await service.update('uuid-1', {
        name: '  Trimmed  ',
        baseUrl: '  https://trimmed.com  ',
      });

      expect(prisma.site.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: {
          name: 'Trimmed',
          baseUrl: 'https://trimmed.com',
        },
      });
    });

    it('should throw NotFoundException for nonexistent id', async () => {
      prisma.site.findUnique.mockResolvedValue(null);

      try {
        await service.update('nonexistent', { name: 'Test' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw BadRequestException when name is empty', async () => {
      try {
        await service.update('uuid-1', { name: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when baseUrl is empty', async () => {
      try {
        await service.update('uuid-1', { baseUrl: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when isActive is not boolean', async () => {
      try {
        await service.update('uuid-1', {
          isActive: 'yes' as unknown as boolean,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw ConflictException for duplicate name', async () => {
      prisma.site.update.mockRejectedValue(
        Object.assign(new Error('Unique constraint failed'), {
          code: 'P2002',
          clientVersion: '7.0.0',
          meta: { target: ['name'] },
        }),
      );

      try {
        await service.update('uuid-1', { name: 'Existing Name' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should rethrow non-P2002 errors on update', async () => {
      prisma.site.update.mockRejectedValue(
        Object.assign(new Error('Connection refused'), {
          code: 'P1001',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.update('uuid-1', { name: 'Test' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection refused');
      }
    });
  });

  describe('remove', () => {
    it('should delete an existing site', async () => {
      prisma.site.delete.mockResolvedValue(undefined);

      await service.remove('uuid-1');

      expect(prisma.site.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
    });

    it('should throw NotFoundException when site does not exist', async () => {
      const prismaError = Object.assign(
        new Error('Record to delete does not exist'),
        { code: 'P2025', clientVersion: '7.0.0' },
      );
      prisma.site.delete.mockRejectedValue(prismaError);

      try {
        await service.remove('nonexistent-id');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }

      expect(prisma.site.delete).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
    });

    it('should rethrow non-P2025 errors from Prisma', async () => {
      const dbError = Object.assign(new Error('Connection refused'), {
        code: 'P1001',
        clientVersion: '7.0.0',
      });
      prisma.site.delete.mockRejectedValue(dbError);

      try {
        await service.remove('uuid-1');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection refused');
      }
    });
  });
});
