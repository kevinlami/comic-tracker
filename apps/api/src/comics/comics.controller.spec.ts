import { Test, TestingModule } from '@nestjs/testing';
import { ComicsController } from './comics.controller';
import { ComicsService } from './comics.service';
import { CreateComicDto } from './dto/create-comic.dto';

describe('ComicsController', () => {
  let controller: ComicsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComicsController],
      providers: [
        { provide: ComicsService, useValue: service },
      ],
    }).compile();

    controller = module.get<ComicsController>(ComicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comic and return it', async () => {
      const dto: CreateComicDto = { title: 'One Piece' };
      const expected = {
        id: 'uuid-1',
        title: 'One Piece',
        alternativeTitles: [],
        type: 'MANGA',
        status: 'UNKNOWN',
        coverUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('should pass full dto to service', async () => {
      const dto: CreateComicDto = {
        title: 'Solo Leveling',
        alternativeTitles: ['나 혼자만 레벨업'],
        type: 'MANHWA',
        status: 'COMPLETED',
        coverUrl: 'https://example.com/cover.jpg',
      };

      service.create.mockResolvedValue({
        id: 'uuid-2',
        title: dto.title,
        alternativeTitles: dto.alternativeTitles,
        type: dto.type,
        status: dto.status,
        coverUrl: dto.coverUrl,
      });

      await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all comics', async () => {
      const comics = [
        { id: '1', title: 'Berserk' },
        { id: '2', title: 'One Piece' },
      ];
      service.findAll.mockResolvedValue(comics);

      const result = await controller.findAll();

      expect(result).toEqual(comics);
    });

    it('should return empty array when no comics', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a comic when found', async () => {
      const comic = {
        id: 'uuid-1',
        title: 'One Piece',
        alternativeTitles: [],
        type: 'MANGA',
        status: 'ONGOING',
        coverUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.findOne.mockResolvedValue(comic);

      const result = await controller.findOne('uuid-1');

      expect(service.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(comic);
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('nonexistent')).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should update a comic and return it', async () => {
      const dto = { title: 'New Title' };
      const updated = {
        id: 'uuid-1',
        title: 'New Title',
        alternativeTitles: [],
        type: 'MANGA',
        status: 'ONGOING',
        coverUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.update.mockResolvedValue(updated);

      const result = await controller.update('uuid-1', dto);

      expect(service.update).toHaveBeenCalledWith('uuid-1', dto);
      expect(result).toEqual(updated);
    });

    it('should propagate NotFoundException from service', async () => {
      service.update.mockRejectedValue(new Error('Not found'));

      await expect(
        controller.update('nonexistent', { title: 'Test' }),
      ).rejects.toThrow('Not found');
    });

    it('should propagate BadRequestException from service', async () => {
      service.update.mockRejectedValue(new Error('Bad request'));

      await expect(
        controller.update('uuid-1', { title: '' }),
      ).rejects.toThrow('Bad request');
    });
  });
});
