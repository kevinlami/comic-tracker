import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChaptersService', () => {
  let service: ChaptersService;
  let prisma: {
    chapter: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    comicSite: {
      findUnique: jest.Mock;
    };
  };

  const existingComicSite = {
    id: 'cs-1',
    comicId: 'comic-1',
    siteId: 'site-1',
    url: 'https://mangaplus.shueisha.co.jp/solo-leveling',
    isAvailable: true,
    lastCheckedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
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

  const existingChapter = {
    id: 'ch-1',
    comicSiteId: 'cs-1',
    number: '1.5',
    title: 'Chapter 1.5',
    url: 'https://mangaplus.shueisha.co.jp/solo-leveling/1.5',
    publishedAt: new Date('2024-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
    comicSite: {
      ...existingComicSite,
      comic: existingComic,
      site: existingSite,
    },
  };

  beforeEach(async () => {
    prisma = {
      chapter: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      comicSite: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChaptersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ChaptersService>(ChaptersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      prisma.comicSite.findUnique.mockResolvedValue(existingComicSite);
    });

    it('should create a Chapter correctly', async () => {
      prisma.chapter.create.mockResolvedValue(existingChapter);

      const dto = {
        comicSiteId: 'cs-1',
        number: '1.5',
        url: 'https://mangaplus.shueisha.co.jp/solo-leveling/1.5',
      };

      const result = await service.create(dto);

      expect(prisma.chapter.create).toHaveBeenCalledWith({
        data: {
          comicSiteId: 'cs-1',
          number: '1.5',
          title: undefined,
          url: 'https://mangaplus.shueisha.co.jp/solo-leveling/1.5',
          publishedAt: undefined,
        },
        include: {
          comicSite: {
            include: { comic: true, site: true },
          },
        },
      });
      expect(result).toEqual(existingChapter);
    });

    it('should create with title and publishedAt', async () => {
      const now = new Date();
      const created = { ...existingChapter, title: 'New Title', publishedAt: now };
      prisma.chapter.create.mockResolvedValue(created);

      const result = await service.create({
        comicSiteId: 'cs-1',
        number: '2',
        title: 'New Title',
        url: 'https://example.com/2',
        publishedAt: now,
      });

      expect(prisma.chapter.create).toHaveBeenCalledWith({
        data: {
          comicSiteId: 'cs-1',
          number: '2',
          title: 'New Title',
          url: 'https://example.com/2',
          publishedAt: now,
        },
        include: {
          comicSite: {
            include: { comic: true, site: true },
          },
        },
      });
      expect(result).toEqual(created);
    });

    it('should accept number "1"', async () => {
      prisma.chapter.create.mockResolvedValue(existingChapter);

      await service.create({
        comicSiteId: 'cs-1',
        number: '1',
        url: 'https://example.com/1',
      });

      expect(prisma.chapter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ number: '1' }),
        }),
      );
    });

    it('should accept number "10.125"', async () => {
      prisma.chapter.create.mockResolvedValue(existingChapter);

      await service.create({
        comicSiteId: 'cs-1',
        number: '10.125',
        url: 'https://example.com/10.125',
      });

      expect(prisma.chapter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ number: '10.125' }),
        }),
      );
    });

    it('should trim url', async () => {
      prisma.chapter.create.mockResolvedValue(existingChapter);

      await service.create({
        comicSiteId: 'cs-1',
        number: '1',
        url: '  https://example.com  ',
      });

      expect(prisma.chapter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ url: 'https://example.com' }),
        }),
      );
    });

    it('should trim number', async () => {
      prisma.chapter.create.mockResolvedValue(existingChapter);

      await service.create({
        comicSiteId: 'cs-1',
        number: '  1.5  ',
        url: 'https://example.com',
      });

      expect(prisma.chapter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ number: '1.5' }),
        }),
      );
    });

    it('should accept title as null', async () => {
      prisma.chapter.create.mockResolvedValue(existingChapter);

      await service.create({
        comicSiteId: 'cs-1',
        number: '1',
        title: null,
        url: 'https://example.com',
      });

      expect(prisma.chapter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: null }),
        }),
      );
    });

    it('should accept publishedAt as null', async () => {
      prisma.chapter.create.mockResolvedValue(existingChapter);

      await service.create({
        comicSiteId: 'cs-1',
        number: '1',
        url: 'https://example.com',
        publishedAt: null,
      });

      expect(prisma.chapter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ publishedAt: null }),
        }),
      );
    });

    it('should throw BadRequestException when dto is undefined', async () => {
      try {
        await service.create(undefined as unknown as { comicSiteId: string; number: string; url: string });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when comicSiteId is empty', async () => {
      try {
        await service.create({ comicSiteId: '', number: '1', url: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when number is empty', async () => {
      try {
        await service.create({ comicSiteId: 'cs-1', number: '', url: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when number has more than 3 decimal places', async () => {
      try {
        await service.create({ comicSiteId: 'cs-1', number: '1.1234', url: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when number is not a valid decimal', async () => {
      try {
        await service.create({ comicSiteId: 'cs-1', number: 'abc', url: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when url is empty', async () => {
      try {
        await service.create({ comicSiteId: 'cs-1', number: '1', url: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when title is not string or null', async () => {
      try {
        await service.create({
          comicSiteId: 'cs-1',
          number: '1',
          url: 'https://example.com',
          title: 123 as unknown as string,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when publishedAt is invalid', async () => {
      try {
        await service.create({
          comicSiteId: 'cs-1',
          number: '1',
          url: 'https://example.com',
          publishedAt: 'not-a-date' as unknown as Date,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw NotFoundException when comicSite does not exist', async () => {
      prisma.comicSite.findUnique.mockResolvedValue(null);

      try {
        await service.create({
          comicSiteId: 'nonexistent',
          number: '1',
          url: 'https://example.com',
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw ConflictException for duplicate comicSiteId+number', async () => {
      prisma.chapter.create.mockRejectedValue(
        Object.assign(new Error('Unique constraint failed'), {
          code: 'P2002',
          clientVersion: '7.0.0',
          meta: { target: ['comicSiteId', 'number'] },
        }),
      );

      try {
        await service.create({
          comicSiteId: 'cs-1',
          number: '1',
          url: 'https://example.com',
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should rethrow non-P2002 errors', async () => {
      prisma.chapter.create.mockRejectedValue(
        Object.assign(new Error('Connection refused'), {
          code: 'P1001',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.create({
          comicSiteId: 'cs-1',
          number: '1',
          url: 'https://example.com',
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection refused');
      }
    });
  });

  describe('findAll', () => {
    it('should return all Chapters', async () => {
      prisma.chapter.findMany.mockResolvedValue([existingChapter]);

      const result = await service.findAll();

      expect(result).toEqual([existingChapter]);
    });

    it('should include comicSite with comic and site', async () => {
      prisma.chapter.findMany.mockResolvedValue([existingChapter]);

      await service.findAll();

      expect(prisma.chapter.findMany).toHaveBeenCalledWith({
        orderBy: [{ comicSiteId: 'asc' }, { number: 'asc' }],
        include: {
          comicSite: {
            include: { comic: true, site: true },
          },
        },
      });
    });

    it('should return empty array when no Chapters exist', async () => {
      prisma.chapter.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a Chapter when found', async () => {
      prisma.chapter.findUnique.mockResolvedValue(existingChapter);

      const result = await service.findOne('ch-1');

      expect(prisma.chapter.findUnique).toHaveBeenCalledWith({
        where: { id: 'ch-1' },
        include: {
          comicSite: {
            include: { comic: true, site: true },
          },
        },
      });
      expect(result).toEqual(existingChapter);
    });

    it('should throw NotFoundException when Chapter is not found', async () => {
      prisma.chapter.findUnique.mockResolvedValue(null);

      try {
        await service.findOne('nonexistent');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update', () => {
    beforeEach(() => {
      prisma.chapter.findUnique.mockResolvedValue(existingChapter);
    });

    it('should update only url', async () => {
      const updated = { ...existingChapter, url: 'https://new-url.com' };
      prisma.chapter.update.mockResolvedValue(updated);

      const result = await service.update('ch-1', { url: 'https://new-url.com' });

      expect(prisma.chapter.update).toHaveBeenCalledWith({
        where: { id: 'ch-1' },
        data: { url: 'https://new-url.com' },
        include: {
          comicSite: {
            include: { comic: true, site: true },
          },
        },
      });
      expect(result).toEqual(updated);
    });

    it('should update only title', async () => {
      const updated = { ...existingChapter, title: 'New Title' };
      prisma.chapter.update.mockResolvedValue(updated);

      const result = await service.update('ch-1', { title: 'New Title' });

      expect(prisma.chapter.update).toHaveBeenCalledWith({
        where: { id: 'ch-1' },
        data: { title: 'New Title' },
        include: {
          comicSite: {
            include: { comic: true, site: true },
          },
        },
      });
      expect(result).toEqual(updated);
    });

    it('should update only number', async () => {
      const updated = { ...existingChapter, number: '2' };
      prisma.chapter.update.mockResolvedValue(updated);

      const result = await service.update('ch-1', { number: '2' });

      expect(prisma.chapter.update).toHaveBeenCalledWith({
        where: { id: 'ch-1' },
        data: { number: '2' },
        include: {
          comicSite: {
            include: { comic: true, site: true },
          },
        },
      });
      expect(result).toEqual(updated);
    });

    it('should update publishedAt', async () => {
      const now = new Date();
      const updated = { ...existingChapter, publishedAt: now };
      prisma.chapter.update.mockResolvedValue(updated);

      const result = await service.update('ch-1', { publishedAt: now });

      expect(prisma.chapter.update).toHaveBeenCalledWith({
        where: { id: 'ch-1' },
        data: { publishedAt: now },
        include: {
          comicSite: {
            include: { comic: true, site: true },
          },
        },
      });
      expect(result).toEqual(updated);
    });

    it('should set title to null', async () => {
      const updated = { ...existingChapter, title: null };
      prisma.chapter.update.mockResolvedValue(updated);

      const result = await service.update('ch-1', { title: null });

      expect(prisma.chapter.update).toHaveBeenCalledWith({
        where: { id: 'ch-1' },
        data: { title: null },
        include: {
          comicSite: {
            include: { comic: true, site: true },
          },
        },
      });
      expect(result).toEqual(updated);
    });

    it('should set publishedAt to null', async () => {
      const updated = { ...existingChapter, publishedAt: null };
      prisma.chapter.update.mockResolvedValue(updated);

      const result = await service.update('ch-1', { publishedAt: null });

      expect(prisma.chapter.update).toHaveBeenCalledWith({
        where: { id: 'ch-1' },
        data: { publishedAt: null },
        include: {
          comicSite: {
            include: { comic: true, site: true },
          },
        },
      });
      expect(result).toEqual(updated);
    });

    it('should update comicSiteId and verify new comicSite exists', async () => {
      const newComicSite = { ...existingComicSite, id: 'cs-2' };
      prisma.comicSite.findUnique.mockResolvedValue(newComicSite);
      const updated = { ...existingChapter, comicSiteId: 'cs-2', comicSite: newComicSite };
      prisma.chapter.update.mockResolvedValue(updated);

      const result = await service.update('ch-1', { comicSiteId: 'cs-2' });

      expect(prisma.comicSite.findUnique).toHaveBeenCalledWith({ where: { id: 'cs-2' } });
      expect(result).toEqual(updated);
    });

    it('should update multiple fields at once', async () => {
      const updated = {
        ...existingChapter,
        url: 'https://new-url.com',
        title: 'Updated',
      };
      prisma.chapter.update.mockResolvedValue(updated);

      const result = await service.update('ch-1', {
        url: 'https://new-url.com',
        title: 'Updated',
      });

      expect(prisma.chapter.update).toHaveBeenCalledWith({
        where: { id: 'ch-1' },
        data: { url: 'https://new-url.com', title: 'Updated' },
        include: {
          comicSite: {
            include: { comic: true, site: true },
          },
        },
      });
      expect(result).toEqual(updated);
    });

    it('should not send omitted fields to prisma update', async () => {
      prisma.chapter.update.mockResolvedValue(existingChapter);

      await service.update('ch-1', { url: 'https://new-url.com' });

      const callData = prisma.chapter.update.mock.calls[0][0].data;
      expect(Object.keys(callData)).toEqual(['url']);
    });

    it('should trim number on update', async () => {
      prisma.chapter.update.mockResolvedValue(existingChapter);

      await service.update('ch-1', { number: '  2.5  ' });

      expect(prisma.chapter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ number: '2.5' }),
        }),
      );
    });

    it('should trim url on update', async () => {
      prisma.chapter.update.mockResolvedValue(existingChapter);

      await service.update('ch-1', { url: '  https://new-url.com  ' });

      expect(prisma.chapter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ url: 'https://new-url.com' }),
        }),
      );
    });

    it('should throw NotFoundException when Chapter does not exist', async () => {
      prisma.chapter.findUnique.mockResolvedValue(null);

      try {
        await service.update('nonexistent', { url: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw NotFoundException when new comicSite does not exist', async () => {
      prisma.comicSite.findUnique.mockResolvedValue(null);

      try {
        await service.update('ch-1', { comicSiteId: 'nonexistent' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw BadRequestException when comicSiteId is empty', async () => {
      try {
        await service.update('ch-1', { comicSiteId: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when number is empty', async () => {
      try {
        await service.update('ch-1', { number: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when number has more than 3 decimal places', async () => {
      try {
        await service.update('ch-1', { number: '1.1234' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when number is not a valid decimal', async () => {
      try {
        await service.update('ch-1', { number: 'abc' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when url is empty', async () => {
      try {
        await service.update('ch-1', { url: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw ConflictException for duplicate comicSiteId+number', async () => {
      prisma.comicSite.findUnique.mockResolvedValue(existingComicSite);
      prisma.chapter.update.mockRejectedValue(
        Object.assign(new Error('Unique constraint failed'), {
          code: 'P2002',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.update('ch-1', { number: '1' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should rethrow non-P2002/P2025 errors', async () => {
      prisma.chapter.update.mockRejectedValue(
        Object.assign(new Error('Connection refused'), {
          code: 'P1001',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.update('ch-1', { url: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection refused');
      }
    });
  });

  describe('remove', () => {
    it('should delete an existing Chapter', async () => {
      prisma.chapter.delete.mockResolvedValue(undefined);

      await service.remove('ch-1');

      expect(prisma.chapter.delete).toHaveBeenCalledWith({
        where: { id: 'ch-1' },
      });
    });

    it('should throw NotFoundException when Chapter does not exist', async () => {
      prisma.chapter.delete.mockRejectedValue(
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

      expect(prisma.chapter.delete).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
    });

    it('should rethrow non-P2025 errors', async () => {
      prisma.chapter.delete.mockRejectedValue(
        Object.assign(new Error('Connection refused'), {
          code: 'P1001',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.remove('ch-1');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection refused');
      }
    });
  });
});
