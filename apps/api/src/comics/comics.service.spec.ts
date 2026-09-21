import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ComicsService', () => {
  let service: ComicsService;
  let prisma: {
    comic: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      comic: {
        create: jest.fn(),
        findMany: jest.fn(),
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
        type: 'MANGA',
        status: 'UNKNOWN',
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
        type: 'MANHWA',
        status: 'COMPLETED',
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
          type: 'MANHWA',
          status: 'COMPLETED',
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

    it('should throw BadRequestException when title is missing', async () => {
      await expect(service.create({ title: '' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(
        service.create({ title: undefined as unknown as string }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when title is only whitespace', async () => {
      await expect(service.create({ title: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid type', async () => {
      await expect(
        service.create({ title: 'Test', type: 'INVALID' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(
        service.create({ title: 'Test', status: 'INVALID' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept all valid comic types', async () => {
      const validTypes = [
        'MANGA',
        'MANHWA',
        'MANHUA',
        'WEBTOON',
        'COMIC',
        'OTHER',
      ];

      for (const type of validTypes) {
        prisma.comic.create.mockResolvedValue({ id: '1', type });
        const result = await service.create({ title: 'Test', type });
        expect(result.type).toBe(type);
      }
    });

    it('should accept all valid comic statuses', async () => {
      const validStatuses = [
        'ONGOING',
        'COMPLETED',
        'HIATUS',
        'CANCELLED',
        'UNKNOWN',
      ];

      for (const status of validStatuses) {
        prisma.comic.create.mockResolvedValue({ id: '1', status });
        const result = await service.create({ title: 'Test', status });
        expect(result.status).toBe(status);
      }
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
});
