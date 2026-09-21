import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { PrismaService } from '../prisma/prisma.service';
import { ComicType, ComicStatus } from '../generated/enums';

describe('ComicsService', () => {
  let service: ComicsService;
  let prisma: {
    comic: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      comic: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComicsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ComicsService>(ComicsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a comic with only title', async () => {
      const dto = { title: 'One Piece' };
      const expected = {
        id: 'uuid-1',
        title: 'One Piece',
        alternativeTitles: [],
        type: ComicType.MANGA,
        status: ComicStatus.UNKNOWN,
        coverUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.comic.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(prisma.comic.create).toHaveBeenCalledWith({
        data: {
          title: 'One Piece',
          alternativeTitles: [],
          type: undefined,
          status: undefined,
          coverUrl: undefined,
        },
      });
      expect(result).toEqual(expected);
    });

    it('should create a comic with all fields', async () => {
      const dto = {
        title: 'Solo Leveling',
        alternativeTitles: ['나 혼자만 레벨업'],
        type: ComicType.MANHWA,
        status: ComicStatus.COMPLETED,
        coverUrl: 'https://example.com/cover.jpg',
      };
      const expected = {
        id: 'uuid-2',
        title: dto.title,
        alternativeTitles: dto.alternativeTitles,
        type: dto.type,
        status: dto.status,
        coverUrl: dto.coverUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.comic.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(prisma.comic.create).toHaveBeenCalledWith({
        data: {
          title: 'Solo Leveling',
          alternativeTitles: ['나 혼자만 레벨업'],
          type: ComicType.MANHWA,
          status: ComicStatus.COMPLETED,
          coverUrl: 'https://example.com/cover.jpg',
        },
      });
      expect(result).toEqual(expected);
    });

    it('should trim title whitespace', async () => {
      const dto = { title: '  One Piece  ' };
      prisma.comic.create.mockResolvedValue({ id: '1', title: 'One Piece' });

      await service.create(dto);

      expect(prisma.comic.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'One Piece' }),
        }),
      );
    });

    it('should throw BadRequestException when dto is undefined', async () => {
      await expect(
        service.create(undefined as unknown as { title: string }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when dto is empty', async () => {
      await expect(service.create({} as { title: string })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when title is empty', async () => {
      await expect(service.create({ title: '' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when title is only whitespace', async () => {
      await expect(service.create({ title: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid type', async () => {
      await expect(
        service.create({ title: 'Test', type: 'INVALID' as ComicType }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(
        service.create({ title: 'Test', status: 'INVALID' as ComicStatus }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept all valid comic types', async () => {
      for (const type of Object.values(ComicType)) {
        prisma.comic.create.mockResolvedValue({ id: '1', type });
        const result = await service.create({ title: 'Test', type });
        expect(result.type).toBe(type);
      }
    });

    it('should accept all valid comic statuses', async () => {
      for (const status of Object.values(ComicStatus)) {
        prisma.comic.create.mockResolvedValue({ id: '1', status });
        const result = await service.create({ title: 'Test', status });
        expect(result.status).toBe(status);
      }
    });

    it('should throw BadRequestException when alternativeTitles is not an array', async () => {
      await expect(
        service.create({
          title: 'Test',
          alternativeTitles: 'not-an-array' as unknown as string[],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when alternativeTitles contains non-strings', async () => {
      await expect(
        service.create({
          title: 'Test',
          alternativeTitles: [123, true] as unknown as string[],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept valid alternativeTitles array', async () => {
      prisma.comic.create.mockResolvedValue({ id: '1' });
      await service.create({
        title: 'Test',
        alternativeTitles: ['Alt 1', 'Alt 2'],
      });
      expect(prisma.comic.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            alternativeTitles: ['Alt 1', 'Alt 2'],
          }),
        }),
      );
    });

    it('should throw BadRequestException when coverUrl is not a string or null', async () => {
      await expect(
        service.create({
          title: 'Test',
          coverUrl: 123 as unknown as string,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept coverUrl as null', async () => {
      prisma.comic.create.mockResolvedValue({ id: '1' });
      await service.create({ title: 'Test', coverUrl: null });
      expect(prisma.comic.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ coverUrl: null }),
        }),
      );
    });

    it('should accept coverUrl as valid string', async () => {
      prisma.comic.create.mockResolvedValue({ id: '1' });
      await service.create({
        title: 'Test',
        coverUrl: 'https://example.com/cover.jpg',
      });
      expect(prisma.comic.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            coverUrl: 'https://example.com/cover.jpg',
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return an empty array when no comics exist', async () => {
      prisma.comic.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(prisma.comic.findMany).toHaveBeenCalledWith({
        orderBy: { title: 'asc' },
      });
    });

    it('should return comics ordered by title', async () => {
      const comics = [
        { id: '1', title: 'Berserk' },
        { id: '2', title: 'One Piece' },
      ];
      prisma.comic.findMany.mockResolvedValue(comics);

      const result = await service.findAll();

      expect(result).toEqual(comics);
    });
  });

  describe('findOne', () => {
    it('should return a comic when found', async () => {
      const comic = {
        id: 'uuid-1',
        title: 'One Piece',
        alternativeTitles: [],
        type: ComicType.MANGA,
        status: ComicStatus.ONGOING,
        coverUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.comic.findUnique.mockResolvedValue(comic);

      const result = await service.findOne('uuid-1');

      expect(prisma.comic.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(comic);
    });

    it('should throw NotFoundException when comic is not found', async () => {
      prisma.comic.findUnique.mockResolvedValue(null);

      try {
        await service.findOne('nonexistent-id');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
      expect(prisma.comic.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
    });
  });

  describe('update', () => {
    const existingComic = {
      id: 'uuid-1',
      title: 'One Piece',
      alternativeTitles: ['ワンピース'],
      type: ComicType.MANGA,
      status: ComicStatus.ONGOING,
      coverUrl: 'https://example.com/cover.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      prisma.comic.findUnique.mockResolvedValue(existingComic);
    });

    it('should update only title', async () => {
      const updated = { ...existingComic, title: 'New Title' };
      prisma.comic.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { title: 'New Title' });

      expect(prisma.comic.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { title: 'New Title' },
      });
      expect(result).toEqual(updated);
    });

    it('should update only status', async () => {
      const updated = { ...existingComic, status: ComicStatus.COMPLETED };
      prisma.comic.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', {
        status: ComicStatus.COMPLETED,
      });

      expect(prisma.comic.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { status: ComicStatus.COMPLETED },
      });
      expect(result).toEqual(updated);
    });

    it('should update only type', async () => {
      const updated = { ...existingComic, type: ComicType.MANHWA };
      prisma.comic.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', {
        type: ComicType.MANHWA,
      });

      expect(prisma.comic.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { type: ComicType.MANHWA },
      });
      expect(result).toEqual(updated);
    });

    it('should update only alternativeTitles', async () => {
      const updated = {
        ...existingComic,
        alternativeTitles: ['Alt 1', 'Alt 2'],
      };
      prisma.comic.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', {
        alternativeTitles: ['Alt 1', 'Alt 2'],
      });

      expect(prisma.comic.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { alternativeTitles: ['Alt 1', 'Alt 2'] },
      });
      expect(result).toEqual(updated);
    });

    it('should update coverUrl', async () => {
      const updated = {
        ...existingComic,
        coverUrl: 'https://example.com/new-cover.jpg',
      };
      prisma.comic.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', {
        coverUrl: 'https://example.com/new-cover.jpg',
      });

      expect(prisma.comic.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { coverUrl: 'https://example.com/new-cover.jpg' },
      });
      expect(result).toEqual(updated);
    });

    it('should update coverUrl to null', async () => {
      const updated = { ...existingComic, coverUrl: null };
      prisma.comic.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { coverUrl: null });

      expect(prisma.comic.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { coverUrl: null },
      });
      expect(result).toEqual(updated);
    });

    it('should update multiple fields at once', async () => {
      const updated = {
        ...existingComic,
        title: 'New Title',
        status: ComicStatus.COMPLETED,
        coverUrl: null,
      };
      prisma.comic.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', {
        title: 'New Title',
        status: ComicStatus.COMPLETED,
        coverUrl: null,
      });

      expect(prisma.comic.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: {
          title: 'New Title',
          status: ComicStatus.COMPLETED,
          coverUrl: null,
        },
      });
      expect(result).toEqual(updated);
    });

    it('should not send omitted fields to prisma update', async () => {
      prisma.comic.update.mockResolvedValue(existingComic);

      await service.update('uuid-1', { title: 'New Title' });

      const callData = prisma.comic.update.mock.calls[0][0].data;
      expect(Object.keys(callData)).toEqual(['title']);
    });

    it('should throw NotFoundException for nonexistent id', async () => {
      prisma.comic.findUnique.mockResolvedValue(null);

      try {
        await service.update('nonexistent', { title: 'Test' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw BadRequestException when title is empty', async () => {
      try {
        await service.update('uuid-1', { title: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when title is only whitespace', async () => {
      try {
        await service.update('uuid-1', { title: '   ' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when alternativeTitles is not an array', async () => {
      try {
        await service.update('uuid-1', {
          alternativeTitles: 'not-an-array' as unknown as string[],
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException for invalid type', async () => {
      try {
        await service.update('uuid-1', {
          type: 'INVALID' as ComicType,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException for invalid status', async () => {
      try {
        await service.update('uuid-1', {
          status: 'INVALID' as ComicStatus,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when coverUrl is not a string or null', async () => {
      try {
        await service.update('uuid-1', {
          coverUrl: 123 as unknown as string,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should trim title when updating', async () => {
      prisma.comic.update.mockResolvedValue(existingComic);

      await service.update('uuid-1', { title: '  Trimmed  ' });

      expect(prisma.comic.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { title: 'Trimmed' },
      });
    });

    it('should accept empty alternativeTitles array', async () => {
      const updated = { ...existingComic, alternativeTitles: [] };
      prisma.comic.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', {
        alternativeTitles: [],
      });

      expect(prisma.comic.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { alternativeTitles: [] },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete an existing comic', async () => {
      prisma.comic.delete.mockResolvedValue(undefined);

      await service.remove('uuid-1');

      expect(prisma.comic.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
    });

    it('should throw NotFoundException when comic does not exist', async () => {
      const prismaError = Object.assign(new Error('Record to delete does not exist'), {
        code: 'P2025',
        clientVersion: '7.0.0',
      });
      prisma.comic.delete.mockRejectedValue(prismaError);

      try {
        await service.remove('nonexistent-id');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }

      expect(prisma.comic.delete).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
    });

    it('should not call delete when id is nonexistent (NotFoundException thrown by delete mock)', async () => {
      const prismaError = Object.assign(new Error('Record to delete does not exist'), {
        code: 'P2025',
        clientVersion: '7.0.0',
      });
      prisma.comic.delete.mockRejectedValue(prismaError);

      try {
        await service.remove('nonexistent-id');
      } catch {
        // expected
      }

      expect(prisma.comic.delete).toHaveBeenCalledTimes(1);
      expect(prisma.comic.delete).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
    });

    it('should rethrow non-P2025 errors from Prisma', async () => {
      const dbError = Object.assign(new Error('Connection refused'), {
        code: 'P1001',
        clientVersion: '7.0.0',
      });
      prisma.comic.delete.mockRejectedValue(dbError);

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
