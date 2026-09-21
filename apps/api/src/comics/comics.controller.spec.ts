import { Test, TestingModule } from '@nestjs/testing';
import { ComicsController } from './comics.controller';
import { ComicsService } from './comics.service';
import { CreateComicDto } from './dto/create-comic.dto';

describe('ComicsController', () => {
  let controller: ComicsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
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
});
