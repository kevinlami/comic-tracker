import { Test, TestingModule } from '@nestjs/testing';
import { SiteAdapterRegistryService } from './site-adapter-registry.service';
import { SiteAdapter } from './site-adapter.interface';

describe('SiteAdapterRegistryService', () => {
  let service: SiteAdapterRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiteAdapterRegistryService],
    }).compile();

    service = module.get<SiteAdapterRegistryService>(SiteAdapterRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerAdapter', () => {
    it('should register an adapter for a site', () => {
      const mockAdapter: SiteAdapter = {
        checkAvailability: jest.fn().mockResolvedValue({ available: true }),
        getComicInfo: jest.fn().mockResolvedValue({
          title: 'Test Comic',
        }),
        getChapters: jest.fn().mockResolvedValue([
          { number: '1', title: 'Chapter 1', url: 'https://example.com/chapter/1' },
        ]),
      };

      service.registerAdapter('manga-site', mockAdapter);

      expect(service['adapters'].has('manga-site')).toBe(true);
    });

    it('should allow re-registering an adapter (overwrite)', () => {
      const mockAdapter1: SiteAdapter = {
        checkAvailability: jest.fn(),
        getComicInfo: jest.fn(),
        getChapters: jest.fn(),
      };
      const mockAdapter2: SiteAdapter = {
        checkAvailability: jest.fn(),
        getComicInfo: jest.fn(),
        getChapters: jest.fn(),
      };

      service.registerAdapter('manga-site', mockAdapter1);
      service.registerAdapter('manga-site', mockAdapter2);

      expect(service['adapters'].get('manga-site')).toBe(mockAdapter2);
    });
  });

  describe('resolveAdapter', () => {
    beforeEach(() => {
      service['adapters'].set('manga-site', {
        checkAvailability: jest.fn(),
        getComicInfo: jest.fn(),
        getChapters: jest.fn(),
      } as unknown as SiteAdapter);
    });

    it('should return the registered adapter', () => {
      const result = service.resolveAdapter('manga-site');

      expect(result.found).toBe(true);
      expect(result.adapter).toBeDefined();
      expect(result.site).toBe('manga-site');
    });

    it('should return not found when no adapter is registered', () => {
      const result = service.resolveAdapter('nonexistent-site');

      expect(result.found).toBe(false);
      expect(result.adapter).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('should return not found for empty string', () => {
      const result = service.resolveAdapter('');

      expect(result.found).toBe(false);
      expect(result.adapter).toBeNull();
    });
  });

  describe('hasAdapter', () => {
    beforeEach(() => {
      service['adapters'].set('manga-site', {
        checkAvailability: jest.fn(),
        getComicInfo: jest.fn(),
        getChapters: jest.fn(),
      } as unknown as SiteAdapter);
    });

    it('should return true for registered site', () => {
      expect(service.hasAdapter('manga-site')).toBe(true);
    });

    it('should return false for unregistered site', () => {
      expect(service.hasAdapter('nonexistent')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.hasAdapter('')).toBe(false);
    });
  });

  describe('getRegisteredSites', () => {
    beforeEach(() => {
      service['adapters'].set('manga-site', {
        checkAvailability: jest.fn(),
        getComicInfo: jest.fn(),
        getChapters: jest.fn(),
      } as unknown as SiteAdapter);
      service['adapters'].set('anime-site', {
        checkAvailability: jest.fn(),
        getComicInfo: jest.fn(),
        getChapters: jest.fn(),
      } as unknown as SiteAdapter);
    });

    it('should return all registered site identifiers', () => {
      const sites = service.getRegisteredSites();

      expect(sites).toContain('manga-site');
      expect(sites).toContain('anime-site');
      expect(sites.length).toBe(2);
    });
  });
});