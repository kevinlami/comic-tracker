import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ReadingProgressService } from './reading-progress.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReadingProgressService', () => {
  let service: ReadingProgressService;
  let prisma: {
    readingProgress: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    comic: {
      findUnique: jest.Mock;
    };
    chapter: {
      findUnique: jest.Mock;
    };
  };

  const existingComic = {
    id: 'comic-1',
    title: 'Solo Leveling',
    alternativeTitles: [],
    type: 'MANHWA',
    status: 'COMPLETED',
    coverUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const existingChapter = {
    id: 'ch-1',
    comicSiteId: 'cs-1',
    number: '1.5',
    title: 'Chapter 1.5',
    url: 'https://mangaplus.shueisha.co.jp/solo-leveling/1.5',
    publishedAt: new Date('2024-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const existingReadingProgress = {
    id: 'rp-1',
    comicId: 'comic-1',
    currentChapterId: 'ch-1',
    status: 'READING',
    createdAt: new Date(),
    updatedAt: new Date(),
    comic: existingComic,
  };

  beforeEach(async () => {
    prisma = {
      readingProgress: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      comic: {
        findUnique: jest.fn(),
      },
      chapter: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingProgressService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReadingProgressService>(ReadingProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      prisma.comic.findUnique.mockResolvedValue(existingComic);
      prisma.chapter.findUnique.mockResolvedValue(existingChapter);
    });

    it('should create a ReadingProgress correctly', async () => {
      prisma.readingProgress.create.mockResolvedValue(existingReadingProgress);

      const dto = {
        comicId: 'comic-1',
        currentChapterId: 'ch-1',
        status: 'READING',
      };

      const result = await service.create(dto);

      expect(prisma.readingProgress.create).toHaveBeenCalledWith({
        data: {
          comicId: 'comic-1',
          currentChapterId: 'ch-1',
          status: 'READING',
        },
        include: { comic: true },
      });
      expect(result).toEqual(existingReadingProgress);
    });

    it('should create without status using default PLAN_TO_READ', async () => {
      const created = { ...existingReadingProgress, status: 'PLAN_TO_READ', currentChapterId: null };
      prisma.readingProgress.create.mockResolvedValue(created);

      const result = await service.create({ comicId: 'comic-1' });

      expect(prisma.readingProgress.create).toHaveBeenCalledWith({
        data: {
          comicId: 'comic-1',
          currentChapterId: undefined,
          status: undefined,
        },
        include: { comic: true },
      });
      expect(result).toEqual(created);
    });

    it('should create with currentChapterId as null', async () => {
      const created = { ...existingReadingProgress, currentChapterId: null };
      prisma.readingProgress.create.mockResolvedValue(created);

      await service.create({ comicId: 'comic-1', currentChapterId: null });

      expect(prisma.readingProgress.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currentChapterId: null }),
        }),
      );
    });

    it('should validate Chapter exists when currentChapterId is provided', async () => {
      prisma.chapter.findUnique.mockResolvedValue(existingChapter);
      prisma.readingProgress.create.mockResolvedValue(existingReadingProgress);

      await service.create({ comicId: 'comic-1', currentChapterId: 'ch-1' });

      expect(prisma.chapter.findUnique).toHaveBeenCalledWith({
        where: { id: 'ch-1' },
      });
    });

    it('should throw BadRequestException when dto is undefined', async () => {
      try {
        await service.create(undefined as unknown as { comicId: string });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when comicId is empty', async () => {
      try {
        await service.create({ comicId: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when currentChapterId is not string or null', async () => {
      try {
        await service.create({
          comicId: 'comic-1',
          currentChapterId: 123 as unknown as string,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when status is invalid', async () => {
      try {
        await service.create({ comicId: 'comic-1', status: 'INVALID' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when status is not a string', async () => {
      try {
        await service.create({ comicId: 'comic-1', status: 123 as unknown as string });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw NotFoundException when comic does not exist', async () => {
      prisma.comic.findUnique.mockResolvedValue(null);

      try {
        await service.create({ comicId: 'nonexistent' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw NotFoundException when chapter does not exist', async () => {
      prisma.chapter.findUnique.mockResolvedValue(null);

      try {
        await service.create({ comicId: 'comic-1', currentChapterId: 'nonexistent' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw ConflictException for duplicate comicId', async () => {
      prisma.readingProgress.create.mockRejectedValue(
        Object.assign(new Error('Unique constraint failed'), {
          code: 'P2002',
          clientVersion: '7.0.0',
          meta: { target: ['comicId'] },
        }),
      );

      try {
        await service.create({ comicId: 'comic-1' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should rethrow non-P2002 errors', async () => {
      prisma.readingProgress.create.mockRejectedValue(
        Object.assign(new Error('Connection refused'), {
          code: 'P1001',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.create({ comicId: 'comic-1' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection refused');
      }
    });
  });

  describe('findAll', () => {
    it('should return all ReadingProgress', async () => {
      prisma.readingProgress.findMany.mockResolvedValue([existingReadingProgress]);

      const result = await service.findAll();

      expect(result).toEqual([existingReadingProgress]);
    });

    it('should include comic', async () => {
      prisma.readingProgress.findMany.mockResolvedValue([existingReadingProgress]);

      await service.findAll();

      expect(prisma.readingProgress.findMany).toHaveBeenCalledWith({
        orderBy: { comicId: 'asc' },
        include: { comic: true },
      });
    });

    it('should return empty array when no ReadingProgress exist', async () => {
      prisma.readingProgress.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOneByComicId', () => {
    it('should return a ReadingProgress when found', async () => {
      prisma.readingProgress.findUnique.mockResolvedValue(existingReadingProgress);

      const result = await service.findOneByComicId('comic-1');

      expect(prisma.readingProgress.findUnique).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
        include: { comic: true },
      });
      expect(result).toEqual(existingReadingProgress);
    });

    it('should throw NotFoundException when ReadingProgress is not found', async () => {
      prisma.readingProgress.findUnique.mockResolvedValue(null);

      try {
        await service.findOneByComicId('nonexistent');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update', () => {
    beforeEach(() => {
      prisma.readingProgress.findUnique.mockResolvedValue(existingReadingProgress);
    });

    it('should update only status', async () => {
      const updated = { ...existingReadingProgress, status: 'COMPLETED' };
      prisma.readingProgress.update.mockResolvedValue(updated);

      const result = await service.update('comic-1', { status: 'COMPLETED' });

      expect(prisma.readingProgress.update).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
        data: { status: 'COMPLETED' },
        include: { comic: true },
      });
      expect(result).toEqual(updated);
    });

    it('should update only currentChapterId', async () => {
      prisma.chapter.findUnique.mockResolvedValue(existingChapter);
      const updated = { ...existingReadingProgress, currentChapterId: 'ch-2' };
      prisma.readingProgress.update.mockResolvedValue(updated);

      const result = await service.update('comic-1', { currentChapterId: 'ch-2' });

      expect(prisma.readingProgress.update).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
        data: { currentChapterId: 'ch-2' },
        include: { comic: true },
      });
      expect(result).toEqual(updated);
    });

    it('should set currentChapterId to null', async () => {
      const updated = { ...existingReadingProgress, currentChapterId: null };
      prisma.readingProgress.update.mockResolvedValue(updated);

      const result = await service.update('comic-1', { currentChapterId: null });

      expect(prisma.readingProgress.update).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
        data: { currentChapterId: null },
        include: { comic: true },
      });
      expect(result).toEqual(updated);
    });

    it('should update multiple fields at once', async () => {
      prisma.chapter.findUnique.mockResolvedValue(existingChapter);
      const updated = {
        ...existingReadingProgress,
        currentChapterId: 'ch-2',
        status: 'PAUSED',
      };
      prisma.readingProgress.update.mockResolvedValue(updated);

      const result = await service.update('comic-1', {
        currentChapterId: 'ch-2',
        status: 'PAUSED',
      });

      expect(prisma.readingProgress.update).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
        data: { currentChapterId: 'ch-2', status: 'PAUSED' },
        include: { comic: true },
      });
      expect(result).toEqual(updated);
    });

    it('should not send omitted fields to prisma update', async () => {
      prisma.readingProgress.update.mockResolvedValue(existingReadingProgress);

      await service.update('comic-1', { status: 'COMPLETED' });

      const callData = prisma.readingProgress.update.mock.calls[0][0].data;
      expect(Object.keys(callData)).toEqual(['status']);
    });

    it('should throw NotFoundException when ReadingProgress does not exist', async () => {
      prisma.readingProgress.findUnique.mockResolvedValue(null);

      try {
        await service.update('nonexistent', { status: 'READING' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw NotFoundException when chapter does not exist', async () => {
      prisma.chapter.findUnique.mockResolvedValue(null);

      try {
        await service.update('comic-1', { currentChapterId: 'nonexistent' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw BadRequestException when currentChapterId is not string or null', async () => {
      try {
        await service.update('comic-1', {
          currentChapterId: 123 as unknown as string,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when status is invalid', async () => {
      try {
        await service.update('comic-1', { status: 'INVALID' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when status is not a string', async () => {
      try {
        await service.update('comic-1', { status: 123 as unknown as string });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw ConflictException for duplicate comicId', async () => {
      prisma.readingProgress.update.mockRejectedValue(
        Object.assign(new Error('Unique constraint failed'), {
          code: 'P2002',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.update('comic-1', { status: 'COMPLETED' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should rethrow non-P2002/P2025 errors', async () => {
      prisma.readingProgress.update.mockRejectedValue(
        Object.assign(new Error('Connection refused'), {
          code: 'P1001',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.update('comic-1', { status: 'READING' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection refused');
      }
    });
  });

  describe('remove', () => {
    it('should delete an existing ReadingProgress', async () => {
      prisma.readingProgress.delete.mockResolvedValue(undefined);

      await service.remove('comic-1');

      expect(prisma.readingProgress.delete).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
      });
    });

    it('should throw NotFoundException when ReadingProgress does not exist', async () => {
      prisma.readingProgress.delete.mockRejectedValue(
        Object.assign(new Error('Record to delete does not exist'), {
          code: 'P2025',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.remove('nonexistent');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }

      expect(prisma.readingProgress.delete).toHaveBeenCalledWith({
        where: { comicId: 'nonexistent' },
      });
    });

    it('should rethrow non-P2025 errors', async () => {
      prisma.readingProgress.delete.mockRejectedValue(
        Object.assign(new Error('Connection refused'), {
          code: 'P1001',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.remove('comic-1');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection refused');
      }
    });
  });
});
