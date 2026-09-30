import { Test, TestingModule } from '@nestjs/testing';
import { ReadingProgressController } from './reading-progress.controller';
import { ReadingProgressService } from './reading-progress.service';
import { CreateReadingProgressDto } from './dto/create-reading-progress.dto';

describe('ReadingProgressController', () => {
  let controller: ReadingProgressController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOneByComicId: jest.Mock;
    update: jest.Mock;
    upsert: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOneByComicId: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingProgressController],
      providers: [
        { provide: ReadingProgressService, useValue: service },
      ],
    }).compile();

    controller = module.get<ReadingProgressController>(ReadingProgressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a ReadingProgress and return it', async () => {
      const dto: CreateReadingProgressDto = {
        comicId: 'comic-1',
        currentChapterNumber: '1.5',
        currentChapterUrl: 'https://example.com/solo-leveling/1.5',
        comicSiteId: 'cs-1',
        status: 'READING',
      };
      const expected = {
        id: 'rp-1',
        comicId: 'comic-1',
        currentChapterNumber: '1.5',
        currentChapterUrl: 'https://example.com/solo-leveling/1.5',
        comicSiteId: 'cs-1',
        lastReadAt: new Date(),
        status: 'READING',
        createdAt: new Date(),
        updatedAt: new Date(),
        comic: { id: 'comic-1', title: 'Solo Leveling' },
      };

      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return all ReadingProgress', async () => {
      const items = [
        { id: 'rp-1', comicId: 'comic-1', status: 'READING' },
        { id: 'rp-2', comicId: 'comic-2', status: 'COMPLETED' },
      ];
      service.findAll.mockResolvedValue(items);

      const result = await controller.findAll();

      expect(result).toEqual(items);
    });

    it('should return empty array when no ReadingProgress', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should forward the status filter to the service', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll('READING');

      expect(service.findAll).toHaveBeenCalledWith('READING');
    });
  });

  describe('findOne', () => {
    it('should return a ReadingProgress when found', async () => {
      const item = {
        id: 'rp-1',
        comicId: 'comic-1',
        status: 'READING',
        comic: { id: 'comic-1', title: 'Solo Leveling' },
      };

      service.findOneByComicId.mockResolvedValue(item);

      const result = await controller.findOne('comic-1');

      expect(service.findOneByComicId).toHaveBeenCalledWith('comic-1');
      expect(result).toEqual(item);
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOneByComicId.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('nonexistent')).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should update a ReadingProgress and return it', async () => {
      const dto = { status: 'COMPLETED' };
      const updated = {
        id: 'rp-1',
        comicId: 'comic-1',
        status: 'COMPLETED',
        comic: { id: 'comic-1', title: 'Solo Leveling' },
      };

      service.update.mockResolvedValue(updated);

      const result = await controller.update('comic-1', dto);

      expect(service.update).toHaveBeenCalledWith('comic-1', dto);
      expect(result).toEqual(updated);
    });

    it('should propagate NotFoundException from service', async () => {
      service.update.mockRejectedValue(new Error('Not found'));

      await expect(
        controller.update('nonexistent', { status: 'READING' }),
      ).rejects.toThrow('Not found');
    });

    it('should propagate ConflictException from service', async () => {
      service.update.mockRejectedValue(new Error('Conflict'));

      await expect(
        controller.update('comic-1', { status: 'READING' }),
      ).rejects.toThrow('Conflict');
    });
  });

  describe('upsert', () => {
    it('should create or update a ReadingProgress in a single call', async () => {
      const dto = {
        currentChapterNumber: '12',
        currentChapterUrl: 'https://example.com/solo-leveling/12',
        comicSiteId: 'cs-1',
      };
      const expected = {
        id: 'rp-1',
        comicId: 'comic-1',
        currentChapterNumber: '12',
        lastReadAt: new Date(),
        status: 'READING',
      };

      service.upsert.mockResolvedValue(expected);

      const result = await controller.upsert('comic-1', dto);

      expect(service.upsert).toHaveBeenCalledWith('comic-1', dto);
      expect(result).toEqual(expected);
    });

    it('should propagate NotFoundException from service', async () => {
      service.upsert.mockRejectedValue(new Error('Not found'));

      await expect(
        controller.upsert('nonexistent', { currentChapterNumber: '1' }),
      ).rejects.toThrow('Not found');
    });
  });

  describe('remove', () => {
    it('should delete a ReadingProgress and return void', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('comic-1');

      expect(service.remove).toHaveBeenCalledWith('comic-1');
      expect(result).toBeUndefined();
    });

    it('should call service with correct comicId', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('my-comic-id');

      expect(service.remove).toHaveBeenCalledWith('my-comic-id');
    });

    it('should propagate NotFoundException from service', async () => {
      service.remove.mockRejectedValue(new Error('Not found'));

      await expect(controller.remove('nonexistent')).rejects.toThrow('Not found');
    });
  });
});
