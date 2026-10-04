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
      upsert: jest.Mock;
      delete: jest.Mock;
    };
    comic: {
      findUnique: jest.Mock;
    };
    comicSite: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const EXPECTED_INCLUDE = {
    comic: true,
    comicSite: { include: { site: true } },
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

  const existingSite = {
    id: 'site-1',
    name: 'MangaPlus',
    baseUrl: 'https://mangaplus.shueisha.co.jp',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const existingComicSite = {
    id: 'cs-1',
    comicId: 'comic-1',
    siteId: 'site-1',
    url: 'https://mangaplus.shueisha.co.jp/solo-leveling',
    currentChapterUrl: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const existingReadingProgress = {
    id: 'rp-1',
    comicId: 'comic-1',
    currentChapterNumber: '1.5',
    comicSiteId: 'cs-1',
    lastReadAt: new Date('2026-01-10T10:00:00.000Z'),
    status: 'READING',
    createdAt: new Date(),
    updatedAt: new Date(),
    comic: existingComic,
    comicSite: { ...existingComicSite, site: existingSite },
  };

  beforeEach(async () => {
    prisma = {
      readingProgress: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
      comic: {
        findUnique: jest.fn(),
      },
      comicSite: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      // Mesma transação para o cliente mock: as operações internas gravam nos
      // mocks do próprio prisma, permitindo asserções sobre elas.
      $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn(prisma),
      ),
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
      prisma.comicSite.findUnique.mockResolvedValue(existingComicSite);
    });

    it('should create a ReadingProgress with chapter info and save the url on the site', async () => {
      prisma.readingProgress.create.mockResolvedValue(existingReadingProgress);

      const dto = {
        comicId: 'comic-1',
        currentChapterNumber: '1.5',
        currentChapterUrl: 'https://mangaplus.shueisha.co.jp/solo-leveling/1.5',
        comicSiteId: 'cs-1',
        status: 'READING',
      };

      const result = await service.create(dto);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: {
          currentChapterUrl: 'https://mangaplus.shueisha.co.jp/solo-leveling/1.5',
        },
      });
      expect(prisma.readingProgress.create).toHaveBeenCalledWith({
        data: {
          comicId: 'comic-1',
          currentChapterNumber: '1.5',
          comicSiteId: 'cs-1',
          status: 'READING',
          lastReadAt: expect.any(Date),
        },
        include: EXPECTED_INCLUDE,
      });
      expect(result).toEqual(existingReadingProgress);
    });

    it('should create without chapter info using lastReadAt null', async () => {
      const created = { ...existingReadingProgress, lastReadAt: null };
      prisma.readingProgress.create.mockResolvedValue(created);

      const result = await service.create({ comicId: 'comic-1' });

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.readingProgress.create).toHaveBeenCalledWith({
        data: {
          comicId: 'comic-1',
          currentChapterNumber: undefined,
          comicSiteId: undefined,
          status: undefined,
          lastReadAt: null,
        },
        include: EXPECTED_INCLUDE,
      });
      expect(result).toEqual(created);
    });

    it('should trim currentChapterNumber and save the trimmed url on the site', async () => {
      prisma.readingProgress.create.mockResolvedValue(existingReadingProgress);

      await service.create({
        comicId: 'comic-1',
        currentChapterNumber: ' 10.5 ',
        currentChapterUrl: ' https://example.com/chapter-10.5 ',
        comicSiteId: 'cs-1',
      });

      expect(prisma.readingProgress.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currentChapterNumber: '10.5',
          }),
        }),
      );
      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: { currentChapterUrl: 'https://example.com/chapter-10.5' },
      });
    });

    it('should use an explicit lastReadAt when provided', async () => {
      const created = {
        ...existingReadingProgress,
        lastReadAt: new Date('2024-08-15T12:00:00.000Z'),
      };
      prisma.readingProgress.create.mockResolvedValue(created);

      await service.create({
        comicId: 'comic-1',
        currentChapterNumber: '10',
        lastReadAt: '2024-08-15T12:00:00.000Z',
      });

      expect(prisma.readingProgress.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lastReadAt: new Date('2024-08-15T12:00:00.000Z'),
          }),
        }),
      );
    });

    it('should throw BadRequestException when lastReadAt is invalid', async () => {
      await expect(
        service.create({ comicId: 'comic-1', lastReadAt: 'not-a-date' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.readingProgress.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when currentChapterUrl is informed without a site', async () => {
      try {
        await service.create({
          comicId: 'comic-1',
          currentChapterUrl: 'https://example.com/chapter-10.5',
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
      expect(prisma.readingProgress.create).not.toHaveBeenCalled();
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

    it('should throw BadRequestException when currentChapterNumber is not string or null', async () => {
      try {
        await service.create({
          comicId: 'comic-1',
          currentChapterNumber: 123 as unknown as string,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when currentChapterNumber has more than 3 decimal places', async () => {
      try {
        await service.create({ comicId: 'comic-1', currentChapterNumber: '10.1234' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when currentChapterUrl is empty', async () => {
      try {
        await service.create({ comicId: 'comic-1', currentChapterUrl: '   ' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when comicSiteId is an empty string', async () => {
      try {
        await service.create({ comicId: 'comic-1', comicSiteId: '' });
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

    it('should throw NotFoundException when comicSite does not exist', async () => {
      prisma.comicSite.findUnique.mockResolvedValue(null);

      try {
        await service.create({ comicId: 'comic-1', comicSiteId: 'nonexistent' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw BadRequestException when comicSite belongs to another comic', async () => {
      prisma.comicSite.findUnique.mockResolvedValue({
        ...existingComicSite,
        comicId: 'another-comic',
      });

      try {
        await service.create({ comicId: 'comic-1', comicSiteId: 'cs-1' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
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

    it('should order by lastReadAt desc (nulls last) and include data', async () => {
      prisma.readingProgress.findMany.mockResolvedValue([existingReadingProgress]);

      await service.findAll();

      expect(prisma.readingProgress.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { lastReadAt: { sort: 'desc', nulls: 'last' } },
        include: EXPECTED_INCLUDE,
      });
    });

    it('should filter by status', async () => {
      prisma.readingProgress.findMany.mockResolvedValue([existingReadingProgress]);

      await service.findAll('READING');

      expect(prisma.readingProgress.findMany).toHaveBeenCalledWith({
        where: { status: 'READING' },
        orderBy: { lastReadAt: { sort: 'desc', nulls: 'last' } },
        include: EXPECTED_INCLUDE,
      });
    });

    it('should treat an empty status as no filter', async () => {
      prisma.readingProgress.findMany.mockResolvedValue([]);

      await service.findAll('');

      expect(prisma.readingProgress.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: undefined }),
      );
    });

    it('should throw BadRequestException when status is invalid', async () => {
      try {
        await service.findAll('INVALID');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
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
        include: EXPECTED_INCLUDE,
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
      prisma.comicSite.findUnique.mockResolvedValue(existingComicSite);
    });

    it('should update only status without touching lastReadAt', async () => {
      const updated = { ...existingReadingProgress, status: 'COMPLETED' };
      prisma.readingProgress.update.mockResolvedValue(updated);

      const result = await service.update('comic-1', { status: 'COMPLETED' });

      expect(prisma.readingProgress.update).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
        data: { status: 'COMPLETED' },
        include: EXPECTED_INCLUDE,
      });
      expect(Object.keys(prisma.readingProgress.update.mock.calls[0][0].data)).toEqual([
        'status',
      ]);
      expect(result).toEqual(updated);
    });

    it('should apply an explicit lastReadAt without touching the chapter', async () => {
      const updated = {
        ...existingReadingProgress,
        lastReadAt: new Date('2024-08-15T12:00:00.000Z'),
      };
      prisma.readingProgress.update.mockResolvedValue(updated);

      await service.update('comic-1', {
        lastReadAt: '2024-08-15T12:00:00.000Z',
      });

      expect(prisma.readingProgress.update).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
        data: { lastReadAt: new Date('2024-08-15T12:00:00.000Z') },
        include: EXPECTED_INCLUDE,
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when lastReadAt is invalid on update', async () => {
      await expect(
        service.update('comic-1', { lastReadAt: 'yesterday' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.readingProgress.update).not.toHaveBeenCalled();
    });

    it('should update chapter info and save the url on the site', async () => {
      const updated = {
        ...existingReadingProgress,
        currentChapterNumber: '2',
      };
      prisma.readingProgress.update.mockResolvedValue(updated);

      const result = await service.update('comic-1', {
        currentChapterNumber: '2',
        currentChapterUrl: 'https://mangaplus.shueisha.co.jp/solo-leveling/2',
        comicSiteId: 'cs-1',
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: {
          currentChapterUrl: 'https://mangaplus.shueisha.co.jp/solo-leveling/2',
        },
      });
      expect(prisma.readingProgress.update).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
        data: {
          currentChapterNumber: '2',
          comicSiteId: 'cs-1',
          lastReadAt: expect.any(Date),
        },
        include: EXPECTED_INCLUDE,
      });
      expect(result).toEqual(updated);
    });

    it('should save the url on the current site when comicSiteId is not sent', async () => {
      prisma.readingProgress.update.mockResolvedValue(existingReadingProgress);

      await service.update('comic-1', {
        currentChapterUrl: 'https://mangaplus.shueisha.co.jp/solo-leveling/2',
      });

      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: {
          currentChapterUrl: 'https://mangaplus.shueisha.co.jp/solo-leveling/2',
        },
      });
      expect(prisma.readingProgress.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { lastReadAt: expect.any(Date) },
        }),
      );
    });

    it('should clear the url on the current site when it is set to null', async () => {
      prisma.readingProgress.update.mockResolvedValue(existingReadingProgress);

      await service.update('comic-1', { currentChapterUrl: null });

      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: { currentChapterUrl: null },
      });
      expect(prisma.readingProgress.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {},
        }),
      );
    });

    it('should ignore clearing the url when there is no target site', async () => {
      prisma.readingProgress.findUnique.mockResolvedValue({
        ...existingReadingProgress,
        comicSiteId: null,
        comicSite: null,
      });
      prisma.readingProgress.update.mockResolvedValue(existingReadingProgress);

      await service.update('comic-1', { currentChapterUrl: null });

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.comicSite.update).not.toHaveBeenCalled();
      expect(prisma.readingProgress.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {},
        }),
      );
    });

    it('should throw BadRequestException when the url is informed without any site', async () => {
      prisma.readingProgress.findUnique.mockResolvedValue({
        ...existingReadingProgress,
        comicSiteId: null,
        comicSite: null,
      });

      try {
        await service.update('comic-1', {
          currentChapterUrl: 'https://example.com/chapter-2',
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
      expect(prisma.readingProgress.update).not.toHaveBeenCalled();
    });

    it('should clear lastReadAt when both chapter fields are set to null', async () => {
      const updated = {
        ...existingReadingProgress,
        currentChapterNumber: null,
        comicSiteId: null,
      };
      prisma.readingProgress.update.mockResolvedValue(updated);

      await service.update('comic-1', {
        currentChapterNumber: null,
        currentChapterUrl: null,
        comicSiteId: null,
      });

      expect(prisma.readingProgress.update).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
        data: {
          currentChapterNumber: null,
          comicSiteId: null,
          lastReadAt: null,
        },
        include: EXPECTED_INCLUDE,
      });
    });

    it('should keep lastReadAt when only currentChapterNumber is cleared', async () => {
      prisma.readingProgress.update.mockResolvedValue(existingReadingProgress);

      await service.update('comic-1', { currentChapterNumber: null });

      const callData = prisma.readingProgress.update.mock.calls[0][0].data;
      expect(Object.keys(callData)).toEqual(['currentChapterNumber']);
    });

    it('should update multiple fields at once', async () => {
      const updated = {
        ...existingReadingProgress,
        currentChapterNumber: '3',
        status: 'PAUSED',
      };
      prisma.readingProgress.update.mockResolvedValue(updated);

      const result = await service.update('comic-1', {
        currentChapterNumber: '3',
        status: 'PAUSED',
      });

      expect(result).toEqual(updated);
      const callData = prisma.readingProgress.update.mock.calls[0][0].data;
      expect(callData.currentChapterNumber).toBe('3');
      expect(callData.status).toBe('PAUSED');
      expect(callData.lastReadAt).toEqual(expect.any(Date));
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

    it('should throw NotFoundException when comicSite does not exist', async () => {
      prisma.comicSite.findUnique.mockResolvedValue(null);

      try {
        await service.update('comic-1', { comicSiteId: 'nonexistent' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw BadRequestException when comicSite belongs to another comic', async () => {
      prisma.comicSite.findUnique.mockResolvedValue({
        ...existingComicSite,
        comicId: 'another-comic',
      });

      try {
        await service.update('comic-1', { comicSiteId: 'cs-1' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when currentChapterNumber is invalid', async () => {
      try {
        await service.update('comic-1', { currentChapterNumber: 'abc' });
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

    it('should rethrow non-P2002 errors', async () => {
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

  describe('upsert', () => {
    beforeEach(() => {
      prisma.comic.findUnique.mockResolvedValue(existingComic);
      prisma.comicSite.findUnique.mockResolvedValue(existingComicSite);
    });

    it('should upsert atomically saving the url on the site', async () => {
      prisma.readingProgress.upsert.mockResolvedValue(existingReadingProgress);

      const result = await service.upsert('comic-1', {
        currentChapterNumber: '1.5',
        currentChapterUrl: 'https://mangaplus.shueisha.co.jp/solo-leveling/1.5',
        comicSiteId: 'cs-1',
        status: 'READING',
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: {
          currentChapterUrl: 'https://mangaplus.shueisha.co.jp/solo-leveling/1.5',
        },
      });
      expect(prisma.readingProgress.upsert).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
        create: {
          comicId: 'comic-1',
          currentChapterNumber: '1.5',
          comicSiteId: 'cs-1',
          status: 'READING',
          lastReadAt: expect.any(Date),
        },
        update: {
          currentChapterNumber: '1.5',
          comicSiteId: 'cs-1',
          status: 'READING',
          lastReadAt: expect.any(Date),
        },
        include: EXPECTED_INCLUDE,
      });
      expect(result).toEqual(existingReadingProgress);
    });

    it('should save the url on the current site when the payload omits comicSiteId', async () => {
      prisma.readingProgress.findUnique.mockResolvedValue(existingReadingProgress);
      prisma.readingProgress.upsert.mockResolvedValue(existingReadingProgress);

      await service.upsert('comic-1', {
        currentChapterUrl: 'https://mangaplus.shueisha.co.jp/solo-leveling/2',
      });

      expect(prisma.readingProgress.findUnique).toHaveBeenCalledWith({
        where: { comicId: 'comic-1' },
        select: { comicSiteId: true },
      });
      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: {
          currentChapterUrl: 'https://mangaplus.shueisha.co.jp/solo-leveling/2',
        },
      });
      expect(prisma.readingProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { lastReadAt: expect.any(Date) },
        }),
      );
    });

    it('should throw BadRequestException when the url is informed without any site', async () => {
      prisma.readingProgress.findUnique.mockResolvedValue(null);

      try {
        await service.upsert('comic-1', {
          currentChapterUrl: 'https://example.com/chapter-2',
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
      expect(prisma.readingProgress.upsert).not.toHaveBeenCalled();
    });

    it('should build create without chapter info and update with only provided fields', async () => {
      prisma.readingProgress.upsert.mockResolvedValue(existingReadingProgress);

      await service.upsert('comic-1', { status: 'PAUSED' });

      const call = prisma.readingProgress.upsert.mock.calls[0][0];
      expect(call.create.lastReadAt).toBeNull();
      expect(call.create.status).toBe('PAUSED');
      expect(Object.keys(call.update)).toEqual(['status']);
    });

    it('should throw BadRequestException when comicId is empty', async () => {
      try {
        await service.upsert('', { status: 'READING' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw NotFoundException when comic does not exist', async () => {
      prisma.comic.findUnique.mockResolvedValue(null);

      try {
        await service.upsert('nonexistent', { status: 'READING' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw NotFoundException when comicSite does not exist', async () => {
      prisma.comicSite.findUnique.mockResolvedValue(null);

      try {
        await service.upsert('comic-1', { comicSiteId: 'nonexistent' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw BadRequestException when comicSite belongs to another comic', async () => {
      prisma.comicSite.findUnique.mockResolvedValue({
        ...existingComicSite,
        comicId: 'another-comic',
      });

      try {
        await service.upsert('comic-1', { comicSiteId: 'cs-1' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when status is invalid', async () => {
      try {
        await service.upsert('comic-1', { status: 'INVALID' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw ConflictException for duplicate comicId', async () => {
      prisma.readingProgress.upsert.mockRejectedValue(
        Object.assign(new Error('Unique constraint failed'), {
          code: 'P2002',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.upsert('comic-1', { status: 'READING' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should rethrow non-P2002 errors', async () => {
      prisma.readingProgress.upsert.mockRejectedValue(
        Object.assign(new Error('Connection refused'), {
          code: 'P1001',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.upsert('comic-1', { status: 'READING' });
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
