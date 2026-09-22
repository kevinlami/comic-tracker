import { Test, TestingModule } from '@nestjs/testing';
import { ToongodAdapter, createToongodAdapter, HttpClient } from './toongod.adapter';
import { SiteAdapterRegistryService } from '../site-adapter-registry.service';

describe('ToongodAdapter', () => {
  let adapter: ToongodAdapter;
  let registry: SiteAdapterRegistryService;

  // Mock HTTP client para testes - usa Promises
  const mockHttpClient: HttpClient = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiteAdapterRegistryService],
    }).compile();

    registry = module.get<SiteAdapterRegistryService>(SiteAdapterRegistryService);
    // Cria adapter com cliente HTTP mockado e registra no registry
    adapter = createToongodAdapter(registry, undefined, mockHttpClient);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
    // Verifica que o método checkAvailability existe sem criar referência indefinida
    expect(typeof adapter.checkAvailability).toBe('function');
  });

  describe('checkAvailability', () => {
    beforeEach(() => {
      // Limpa o mock antes de cada teste
      mockHttpClient.get.mockClear();
    });

    it('should return { available: true } when HTTP returns 200', async () => {
      // Mock: requisição bem-sucedida com status 200
      mockHttpClient.get.mockResolvedValueOnce({
        statusCode: 200,
        headers: {},
      });

      const result = await adapter.checkAvailability();

      expect(result).toEqual({ available: true });
      expect(mockHttpClient.get).toHaveBeenCalled();
    });

    it('should return { available: false } when HTTP returns 4xx', async () => {
      // Mock: erro 403 (Cloudflare/WAF)
      mockHttpClient.get.mockResolvedValueOnce({
        statusCode: 403,
        headers: {},
      } as Record<string, unknown>);

      const result = await adapter.checkAvailability();

      expect(result).toEqual({ available: false });
    });

    it('should return { available: false } when HTTP returns 5xx', async () => {
      // Mock: erro de servidor 500
      mockHttpClient.get.mockResolvedValueOnce({
        statusCode: 500,
        headers: {},
      } as Record<string, unknown>);

      const result = await adapter.checkAvailability();

      expect(result).toEqual({ available: false });
    });

    it('should return { available: false } on network error', async () => {
      // Mock: erro de conexão
      mockHttpClient.get.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await adapter.checkAvailability();

      expect(result).toEqual({ available: false });
    });

    it('should return { available: false } on timeout', async () => {
      // Mock: timeout
      mockHttpClient.get.mockRejectedValueOnce(new Error(' timeout'));

      const result = await adapter.checkAvailability();

      expect(result).toEqual({ available: false });
    });

    it('should follow redirect from toongod.net to ww17.toongod.net and return available: true', async () => {
      // Mock: redirect 302 seguido de 200
      mockHttpClient.get
        .mockResolvedValueOnce({
          statusCode: 302,
          headers: { location: 'http://ww17.toongod.net/' },
        } as Record<string, unknown>)
        .mockResolvedValueOnce({
          statusCode: 200,
          headers: {},
        });

      const result = await adapter.checkAvailability();

      expect(result).toEqual({ available: true });
      // Deve ter feito 2 requisições: a original e o redirect
      expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
    });

    it('should return { available: false } when redirect has no location', async () => {
      // Mock: redirect sem location header
      mockHttpClient.get.mockResolvedValueOnce({
        statusCode: 302,
        headers: {},
      } as Record<string, unknown>);

      const result = await adapter.checkAvailability();

      expect(result).toEqual({ available: false });
    });
  });
});

describe('ToongodAdapter registry integration', () => {
  let service: SiteAdapterRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiteAdapterRegistryService],
    }).compile();

    service = module.get<SiteAdapterRegistryService>(SiteAdapterRegistryService);
    // Registra o ToongodAdapter manualmente, seguindo o padrão existente
    const adapter = new ToongodAdapter(undefined, {
      get: jest.fn(),
    });
    service.registerAdapter('toongod', adapter);
  });

  it('should register ToongodAdapter in the registry', () => {
    expect(service.hasAdapter('toongod')).toBe(true);
  });

  it('should resolve ToongodAdapter via resolveAdapter', () => {
    const result = service.resolveAdapter('toongod');
    expect(result.found).toBe(true);
    expect(result.adapter).toBeDefined();
    expect(result.site).toBe('toongod');
  });

  it('should return not found for other sites', () => {
    const result = service.resolveAdapter('nonexistent');
    expect(result.found).toBe(false);
    expect(result.adapter).toBeNull();
  });

  it('should return registered sites includes toongod', () => {
    const sites = service.getRegisteredSites();
    expect(sites).toContain('toongod');
  });
});