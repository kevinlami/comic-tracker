import { Test, TestingModule } from '@nestjs/testing';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';

describe('SitesController', () => {
  let controller: SitesController;
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
      controllers: [SitesController],
      providers: [
        { provide: SitesService, useValue: service },
      ],
    }).compile();

    controller = module.get<SitesController>(SitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a site and return it', async () => {
      const dto: CreateSiteDto = {
        name: 'MangaPlus',
        baseUrl: 'https://mangaplus.shueisha.co.jp',
      };
      const expected = {
        id: 'uuid-1',
        name: 'MangaPlus',
        baseUrl: 'https://mangaplus.shueisha.co.jp',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('should pass full dto to service', async () => {
      const dto: CreateSiteDto = {
        name: 'MangaPlus',
        baseUrl: 'https://mangaplus.shueisha.co.jp',
        isActive: false,
      };

      service.create.mockResolvedValue({
        id: 'uuid-2',
        name: dto.name,
        baseUrl: dto.baseUrl,
        isActive: dto.isActive,
      });

      await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all sites', async () => {
      const sites = [
        { id: '1', name: 'MangaPlus' },
        { id: '2', name: 'Viz' },
      ];
      service.findAll.mockResolvedValue(sites);

      const result = await controller.findAll();

      expect(result).toEqual(sites);
    });

    it('should return empty array when no sites', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a site when found', async () => {
      const site = {
        id: 'uuid-1',
        name: 'MangaPlus',
        baseUrl: 'https://mangaplus.shueisha.co.jp',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.findOne.mockResolvedValue(site);

      const result = await controller.findOne('uuid-1');

      expect(service.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(site);
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('nonexistent')).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should update a site and return it', async () => {
      const dto = { name: 'New Name' };
      const updated = {
        id: 'uuid-1',
        name: 'New Name',
        baseUrl: 'https://mangaplus.shueisha.co.jp',
        isActive: true,
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
        controller.update('nonexistent', { name: 'Test' }),
      ).rejects.toThrow('Not found');
    });

    it('should propagate ConflictException from service', async () => {
      service.update.mockRejectedValue(new Error('Conflict'));

      await expect(
        controller.update('uuid-1', { name: 'Existing' }),
      ).rejects.toThrow('Conflict');
    });
  });

  describe('remove', () => {
    it('should delete a site and return void', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('uuid-1');

      expect(service.remove).toHaveBeenCalledWith('uuid-1');
      expect(result).toBeUndefined();
    });

    it('should call service with correct id', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('my-site-id');

      expect(service.remove).toHaveBeenCalledWith('my-site-id');
    });

    it('should propagate NotFoundException from service', async () => {
      service.remove.mockRejectedValue(new Error('Not found'));

      await expect(controller.remove('nonexistent')).rejects.toThrow('Not found');
    });
  });
});
