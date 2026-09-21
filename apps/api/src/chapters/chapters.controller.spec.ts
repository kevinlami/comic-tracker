import { Test, TestingModule } from '@nestjs/testing';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';

describe('ChaptersController', () => {
  let controller: ChaptersController;
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
      controllers: [ChaptersController],
      providers: [
        { provide: ChaptersService, useValue: service },
      ],
    }).compile();

    controller = module.get<ChaptersController>(ChaptersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a Chapter and return it', async () => {
      const dto: CreateChapterDto = {
        comicSiteId: 'cs-1',
        number: '1.5',
        url: 'https://example.com/chapter-1.5',
      };
      const expected = {
        id: 'ch-1',
        comicSiteId: 'cs-1',
        number: '1.5',
        title: null,
        url: 'https://example.com/chapter-1.5',
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        comicSite: {
          id: 'cs-1',
          comic: { id: 'comic-1', title: 'Solo Leveling' },
          site: { id: 'site-1', name: 'MangaPlus' },
        },
      };

      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return all Chapters', async () => {
      const chapters = [
        { id: 'ch-1', comicSiteId: 'cs-1', number: '1' },
        { id: 'ch-2', comicSiteId: 'cs-1', number: '2' },
      ];
      service.findAll.mockResolvedValue(chapters);

      const result = await controller.findAll();

      expect(result).toEqual(chapters);
    });

    it('should return empty array when no Chapters', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a Chapter when found', async () => {
      const chapter = {
        id: 'ch-1',
        comicSiteId: 'cs-1',
        number: '1.5',
        title: 'Chapter 1.5',
        url: 'https://example.com',
        comicSite: {
          id: 'cs-1',
          comic: { id: 'comic-1', title: 'Solo Leveling' },
          site: { id: 'site-1', name: 'MangaPlus' },
        },
      };

      service.findOne.mockResolvedValue(chapter);

      const result = await controller.findOne('ch-1');

      expect(service.findOne).toHaveBeenCalledWith('ch-1');
      expect(result).toEqual(chapter);
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('nonexistent')).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should update a Chapter and return it', async () => {
      const dto = { url: 'https://new-url.com' };
      const updated = {
        id: 'ch-1',
        comicSiteId: 'cs-1',
        number: '1.5',
        url: 'https://new-url.com',
        comicSite: {
          id: 'cs-1',
          comic: { id: 'comic-1', title: 'Solo Leveling' },
          site: { id: 'site-1', name: 'MangaPlus' },
        },
      };

      service.update.mockResolvedValue(updated);

      const result = await controller.update('ch-1', dto);

      expect(service.update).toHaveBeenCalledWith('ch-1', dto);
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
        controller.update('ch-1', { number: '2' }),
      ).rejects.toThrow('Conflict');
    });
  });

  describe('remove', () => {
    it('should delete a Chapter and return void', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('ch-1');

      expect(service.remove).toHaveBeenCalledWith('ch-1');
      expect(result).toBeUndefined();
    });

    it('should call service with correct id', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('my-ch-id');

      expect(service.remove).toHaveBeenCalledWith('my-ch-id');
    });

    it('should propagate NotFoundException from service', async () => {
      service.remove.mockRejectedValue(new Error('Not found'));

      await expect(controller.remove('nonexistent')).rejects.toThrow('Not found');
    });
  });
});
