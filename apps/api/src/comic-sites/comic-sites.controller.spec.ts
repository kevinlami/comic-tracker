import { Test, TestingModule } from '@nestjs/testing';
import { ComicSitesController } from './comic-sites.controller';
import { ComicSitesService } from './comic-sites.service';
import { CreateComicSiteDto } from './dto/create-comic-site.dto';

describe('ComicSitesController', () => {
  let controller: ComicSitesController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComicSitesController],
      providers: [
        { provide: ComicSitesService, useValue: service },
      ],
    }).compile();

    controller = module.get<ComicSitesController>(ComicSitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a ComicSite and return it', async () => {
      const dto: CreateComicSiteDto = {
        comicId: 'comic-1',
        siteId: 'site-1',
        url: 'https://example.com/solo-leveling',
      };
      const expected = {
        id: 'cs-1',
        comicId: 'comic-1',
        siteId: 'site-1',
        url: 'https://example.com/solo-leveling',
        isAvailable: true,
        lastCheckedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        comic: { id: 'comic-1', title: 'Solo Leveling' },
        site: { id: 'site-1', name: 'MangaPlus' },
      };

      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return all ComicSites', async () => {
      const comicSites = [
        { id: 'cs-1', comicId: 'comic-1', siteId: 'site-1' },
        { id: 'cs-2', comicId: 'comic-2', siteId: 'site-2' },
      ];
      service.findAll.mockResolvedValue(comicSites);

      const result = await controller.findAll();

      expect(result).toEqual(comicSites);
    });

    it('should return empty array when no ComicSites', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a ComicSite when found', async () => {
      const comicSite = {
        id: 'cs-1',
        comicId: 'comic-1',
        siteId: 'site-1',
        url: 'https://example.com',
        comic: { id: 'comic-1', title: 'Solo Leveling' },
        site: { id: 'site-1', name: 'MangaPlus' },
      };

      service.findOne.mockResolvedValue(comicSite);

      const result = await controller.findOne('cs-1');

      expect(service.findOne).toHaveBeenCalledWith('cs-1');
      expect(result).toEqual(comicSite);
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('nonexistent')).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should update a ComicSite and return it', async () => {
      const dto = { url: 'https://new-url.com' };
      const updated = {
        id: 'cs-1',
        comicId: 'comic-1',
        siteId: 'site-1',
        url: 'https://new-url.com',
        comic: { id: 'comic-1', title: 'Solo Leveling' },
        site: { id: 'site-1', name: 'MangaPlus' },
      };

      service.update.mockResolvedValue(updated);

      const result = await controller.update('cs-1', dto);

      expect(service.update).toHaveBeenCalledWith('cs-1', dto);
      expect(result).toEqual(updated);
    });

    it('should propagate NotFoundException from service', async () => {
      service.update.mockRejectedValue(new Error('Not found'));

      await expect(
        controller.update('nonexistent', { url: 'https://example.com' }),
      ).rejects.toThrow('Not found');
    });

    it('should propagate ConflictException from service', async () => {
      service.update.mockRejectedValue(new Error('Conflict'));

      await expect(
        controller.update('cs-1', { comicId: 'comic-2' }),
      ).rejects.toThrow('Conflict');
    });
  });

  describe('remove', () => {
    it('should delete a ComicSite and return void', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('cs-1');

      expect(service.remove).toHaveBeenCalledWith('cs-1');
      expect(result).toBeUndefined();
    });

    it('should call service with correct id', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('my-cs-id');

      expect(service.remove).toHaveBeenCalledWith('my-cs-id');
    });

    it('should propagate NotFoundException from service', async () => {
      service.remove.mockRejectedValue(new Error('Not found'));

      await expect(controller.remove('nonexistent')).rejects.toThrow('Not found');
    });
  });
});
