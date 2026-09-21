import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ComicSitesService } from './comic-sites.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ComicSitesService', () => {
  let service: ComicSitesService;
  let prisma: {
    comicSite: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    comic: {
      findUnique: jest.Mock;
    };
    site: {
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
    isAvailable: true,
    lastCheckedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    comic: existingComic,
    site: existingSite,
  };

  beforeEach(async () => {
    prisma = {
      comicSite: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      comic: {
        findUnique: jest.fn(),
      },
      site: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComicSitesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ComicSitesService>(ComicSitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      prisma.comic.findUnique.mockResolvedValue(existingComic);
      prisma.site.findUnique.mockResolvedValue(existingSite);
    });

    it('should create a ComicSite correctly', async () => {
      prisma.comicSite.create.mockResolvedValue(existingComicSite);

      const dto = {
        comicId: 'comic-1',
        siteId: 'site-1',
        url: 'https://mangaplus.shueisha.co.jp/solo-leveling',
      };

      const result = await service.create(dto);

      expect(prisma.comicSite.create).toHaveBeenCalledWith({
        data: {
          comicId: 'comic-1',
          siteId: 'site-1',
          url: 'https://mangaplus.shueisha.co.jp/solo-leveling',
          isAvailable: undefined,
          lastCheckedAt: undefined,
        },
        include: { comic: true, site: true },
      });
      expect(result).toEqual(existingComicSite);
    });

    it('should create with isAvailable and lastCheckedAt', async () => {
      const now = new Date();
      const created = { ...existingComicSite, isAvailable: false, lastCheckedAt: now };
      prisma.comicSite.create.mockResolvedValue(created);

      const result = await service.create({
        comicId: 'comic-1',
        siteId: 'site-1',
        url: 'https://example.com',
        isAvailable: false,
        lastCheckedAt: now,
      });

      expect(prisma.comicSite.create).toHaveBeenCalledWith({
        data: {
          comicId: 'comic-1',
          siteId: 'site-1',
          url: 'https://example.com',
          isAvailable: false,
          lastCheckedAt: now,
        },
        include: { comic: true, site: true },
      });
      expect(result).toEqual(created);
    });

    it('should trim url', async () => {
      prisma.comicSite.create.mockResolvedValue(existingComicSite);

      await service.create({
        comicId: 'comic-1',
        siteId: 'site-1',
        url: '  https://example.com  ',
      });

      expect(prisma.comicSite.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ url: 'https://example.com' }),
        }),
      );
    });

    it('should throw BadRequestException when dto is undefined', async () => {
      try {
        await service.create(undefined as unknown as { comicId: string; siteId: string; url: string });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when comicId is empty', async () => {
      try {
        await service.create({ comicId: '', siteId: 'site-1', url: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when siteId is empty', async () => {
      try {
        await service.create({ comicId: 'comic-1', siteId: '', url: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when url is empty', async () => {
      try {
        await service.create({ comicId: 'comic-1', siteId: 'site-1', url: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when isAvailable is not boolean', async () => {
      try {
        await service.create({
          comicId: 'comic-1',
          siteId: 'site-1',
          url: 'https://example.com',
          isAvailable: 'yes' as unknown as boolean,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when lastCheckedAt is invalid', async () => {
      try {
        await service.create({
          comicId: 'comic-1',
          siteId: 'site-1',
          url: 'https://example.com',
          lastCheckedAt: 'not-a-date' as unknown as Date,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should accept lastCheckedAt as null', async () => {
      prisma.comicSite.create.mockResolvedValue(existingComicSite);

      await service.create({
        comicId: 'comic-1',
        siteId: 'site-1',
        url: 'https://example.com',
        lastCheckedAt: null,
      });

      expect(prisma.comicSite.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ lastCheckedAt: null }),
        }),
      );
    });

    it('should throw NotFoundException when comic does not exist', async () => {
      prisma.comic.findUnique.mockResolvedValue(null);

      try {
        await service.create({
          comicId: 'nonexistent',
          siteId: 'site-1',
          url: 'https://example.com',
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw NotFoundException when site does not exist', async () => {
      prisma.site.findUnique.mockResolvedValue(null);

      try {
        await service.create({
          comicId: 'comic-1',
          siteId: 'nonexistent',
          url: 'https://example.com',
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw ConflictException for duplicate comicId+siteId', async () => {
      prisma.comicSite.create.mockRejectedValue(
        Object.assign(new Error('Unique constraint failed'), {
          code: 'P2002',
          clientVersion: '7.0.0',
          meta: { target: ['comicId', 'siteId'] },
        }),
      );

      try {
        await service.create({
          comicId: 'comic-1',
          siteId: 'site-1',
          url: 'https://example.com',
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should rethrow non-P2002 errors', async () => {
      prisma.comicSite.create.mockRejectedValue(
        Object.assign(new Error('Connection refused'), {
          code: 'P1001',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.create({
          comicId: 'comic-1',
          siteId: 'site-1',
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
    it('should return all ComicSites', async () => {
      prisma.comicSite.findMany.mockResolvedValue([existingComicSite]);

      const result = await service.findAll();

      expect(result).toEqual([existingComicSite]);
    });

    it('should include comic and site', async () => {
      prisma.comicSite.findMany.mockResolvedValue([existingComicSite]);

      await service.findAll();

      expect(prisma.comicSite.findMany).toHaveBeenCalledWith({
        include: { comic: true, site: true },
      });
    });

    it('should return empty array when no ComicSites exist', async () => {
      prisma.comicSite.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a ComicSite when found', async () => {
      prisma.comicSite.findUnique.mockResolvedValue(existingComicSite);

      const result = await service.findOne('cs-1');

      expect(prisma.comicSite.findUnique).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        include: { comic: true, site: true },
      });
      expect(result).toEqual(existingComicSite);
    });

    it('should throw NotFoundException when ComicSite is not found', async () => {
      prisma.comicSite.findUnique.mockResolvedValue(null);

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
      prisma.comicSite.findUnique.mockResolvedValue(existingComicSite);
    });

    it('should update only url', async () => {
      const updated = { ...existingComicSite, url: 'https://new-url.com' };
      prisma.comicSite.update.mockResolvedValue(updated);

      const result = await service.update('cs-1', { url: 'https://new-url.com' });

      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: { url: 'https://new-url.com' },
        include: { comic: true, site: true },
      });
      expect(result).toEqual(updated);
    });

    it('should update only isAvailable', async () => {
      const updated = { ...existingComicSite, isAvailable: false };
      prisma.comicSite.update.mockResolvedValue(updated);

      const result = await service.update('cs-1', { isAvailable: false });

      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: { isAvailable: false },
        include: { comic: true, site: true },
      });
      expect(result).toEqual(updated);
    });

    it('should update lastCheckedAt', async () => {
      const now = new Date();
      const updated = { ...existingComicSite, lastCheckedAt: now };
      prisma.comicSite.update.mockResolvedValue(updated);

      const result = await service.update('cs-1', { lastCheckedAt: now });

      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: { lastCheckedAt: now },
        include: { comic: true, site: true },
      });
      expect(result).toEqual(updated);
    });

    it('should set lastCheckedAt to null', async () => {
      const updated = { ...existingComicSite, lastCheckedAt: null };
      prisma.comicSite.update.mockResolvedValue(updated);

      const result = await service.update('cs-1', { lastCheckedAt: null });

      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: { lastCheckedAt: null },
        include: { comic: true, site: true },
      });
      expect(result).toEqual(updated);
    });

    it('should update comicId and verify new comic exists', async () => {
      const newComic = { ...existingComic, id: 'comic-2', title: 'One Piece' };
      prisma.comic.findUnique.mockResolvedValue(newComic);
      const updated = { ...existingComicSite, comicId: 'comic-2', comic: newComic };
      prisma.comicSite.update.mockResolvedValue(updated);

      const result = await service.update('cs-1', { comicId: 'comic-2' });

      expect(prisma.comic.findUnique).toHaveBeenCalledWith({ where: { id: 'comic-2' } });
      expect(result).toEqual(updated);
    });

    it('should update siteId and verify new site exists', async () => {
      const newSite = { ...existingSite, id: 'site-2', name: 'Viz' };
      prisma.site.findUnique.mockResolvedValue(newSite);
      const updated = { ...existingComicSite, siteId: 'site-2', site: newSite };
      prisma.comicSite.update.mockResolvedValue(updated);

      const result = await service.update('cs-1', { siteId: 'site-2' });

      expect(prisma.site.findUnique).toHaveBeenCalledWith({ where: { id: 'site-2' } });
      expect(result).toEqual(updated);
    });

    it('should update multiple fields at once', async () => {
      const updated = {
        ...existingComicSite,
        url: 'https://new-url.com',
        isAvailable: false,
      };
      prisma.comicSite.update.mockResolvedValue(updated);

      const result = await service.update('cs-1', {
        url: 'https://new-url.com',
        isAvailable: false,
      });

      expect(prisma.comicSite.update).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
        data: { url: 'https://new-url.com', isAvailable: false },
        include: { comic: true, site: true },
      });
      expect(result).toEqual(updated);
    });

    it('should not send omitted fields to prisma update', async () => {
      prisma.comicSite.update.mockResolvedValue(existingComicSite);

      await service.update('cs-1', { url: 'https://new-url.com' });

      const callData = prisma.comicSite.update.mock.calls[0][0].data;
      expect(Object.keys(callData)).toEqual(['url']);
    });

    it('should throw NotFoundException when ComicSite does not exist', async () => {
      prisma.comicSite.findUnique.mockResolvedValue(null);

      try {
        await service.update('nonexistent', { url: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw NotFoundException when new comic does not exist', async () => {
      prisma.comic.findUnique.mockResolvedValue(null);

      try {
        await service.update('cs-1', { comicId: 'nonexistent' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw NotFoundException when new site does not exist', async () => {
      prisma.site.findUnique.mockResolvedValue(null);

      try {
        await service.update('cs-1', { siteId: 'nonexistent' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw BadRequestException when url is empty', async () => {
      try {
        await service.update('cs-1', { url: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when comicId is empty', async () => {
      try {
        await service.update('cs-1', { comicId: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException when siteId is empty', async () => {
      try {
        await service.update('cs-1', { siteId: '' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw ConflictException for duplicate comicId+siteId', async () => {
      prisma.comic.findUnique.mockResolvedValue({ ...existingComic, id: 'comic-2' });
      prisma.comicSite.update.mockRejectedValue(
        Object.assign(new Error('Unique constraint failed'), {
          code: 'P2002',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.update('cs-1', { comicId: 'comic-2' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should rethrow non-P2002/P2025 errors', async () => {
      prisma.comicSite.update.mockRejectedValue(
        Object.assign(new Error('Connection refused'), {
          code: 'P1001',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.update('cs-1', { url: 'https://example.com' });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection refused');
      }
    });
  });

  describe('remove', () => {
    it('should delete an existing ComicSite', async () => {
      prisma.comicSite.delete.mockResolvedValue(undefined);

      await service.remove('cs-1');

      expect(prisma.comicSite.delete).toHaveBeenCalledWith({
        where: { id: 'cs-1' },
      });
    });

    it('should throw NotFoundException when ComicSite does not exist', async () => {
      prisma.comicSite.delete.mockRejectedValue(
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

      expect(prisma.comicSite.delete).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
    });

    it('should rethrow non-P2025 errors', async () => {
      prisma.comicSite.delete.mockRejectedValue(
        Object.assign(new Error('Connection refused'), {
          code: 'P1001',
          clientVersion: '7.0.0',
        }),
      );

      try {
        await service.remove('cs-1');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection refused');
      }
    });
  });
});
