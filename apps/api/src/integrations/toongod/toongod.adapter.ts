/**
 * Adapter para o site Toongod (toongod.net).
 * 
 * Este adapter implementa a interface SiteAdapter existente.
 * Apenas o checkAvailability() tem implementação real nesta etapa.
 * Os métodos getComicInfo() e getChapters() são stubs que lançam erro
 * indicando que não foram implementados ainda.
 * 
 * O site Toongod tem o seguinte comportamento:
 * - https://toongod.org: retorna 403 (Cloudflare/WAF)
 * - https://toongod.net: retorna 302 redirect para http://ww17.toongod.net/
 * - http://ww17.toongod.net: retorna 200 (página de ConsentManager GDPR)
 * 
 * O checkAvailability() segue as regras:
 * - Não considera HTTP 4xx/5xx como disponibilidade normal
 * - Trata erros de rede, timeout e redirects de forma controlada
 * - Retorna o tipo SiteAvailability já definido no projeto
 * - Usa módulos nativos Node (http/https) - sem novas dependências
 */

import { SiteAdapter } from '../site-adapter.interface';
import { SiteAdapterRegistryService } from '../site-adapter-registry.service';
import { SiteAdapterRegistryOptions } from '../site-adapter-registry.service';
import { SiteAvailability, ComicInfo, ChapterInfo } from '../site-adapter.types';
import * as http from 'http';

/**
 * Interface para o cliente HTTP - usa Promises para compatibilidade com Jest/mocks.
 */
export type HttpClient = {
  get: (options: {
    hostname: string;
    path?: string;
    timeout?: number;
    headers?: Record<string, string>;
  }) => Promise<{
    statusCode: number;
    headers: Record<string, string>;
  }>;
};

/**
 * Adapter concreto para o Toongod.
 * 
 * Implementa a interface SiteAdapter com foco em checkAvailability().
 * Os métodos getComicInfo() e getChapters() são stubs.
 * O adapter lida com o comportamento específico do site:
 * - Redirect 302 de toongod.net para ww17.toongod.net
 * - Resposta 403 no domínio .org (bloqueado por WAF)
 * - Página de ConsentManager no domínio ww17
 * 
 * @param httpClient Cliente HTTP injetável para testes (usa nativo se não fornecido)
 */
export class ToongodAdapter implements SiteAdapter {
  /** Timeout em milissegundos para requisições HTTP */
  private readonly timeoutMs: number;
  /** Cliente HTTP para realizar as requisições */
  private readonly httpClient: HttpClient;

  /**
   * Cria uma nova instância do ToongodAdapter.
   * @param options Opções de configuração
   * @param httpClient Cliente HTTP injetável (usa o nativo se não fornecido)
   */
  constructor(
    options?: SiteAdapterRegistryOptions,
    httpClient?: HttpClient,
  ) {
    this.timeoutMs = options?.timeoutMs || 10000;
    // Usa o cliente injetado ou o padrão do Node.js
    this.httpClient = httpClient || this.defaultHttpClient;
  }

  /** Cliente HTTP padrão usando os módulos nativos do Node.js. */
  private defaultHttpClient: HttpClient = {
    get: async (options): Promise<{
      statusCode: number;
      headers: Record<string, string>;
    }> => {
      const { hostname, path = '/', timeout = this.timeoutMs, headers: extraHeaders } = options;
      const http = require('http');

      return new Promise((resolve, reject) => {
        const req = http.get(
          {
            hostname,
            path,
            timeout,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              ...extraHeaders,
            },
          },
          (res: http.IncomingMessage): void => {
            let body = '';
            res.on('data', (chunk: string) => { body += chunk; });
            res.on('end', () => {
              resolve({
                statusCode: res.statusCode || 0,
                headers: res.headers as Record<string, string>,
              });
            });
          },
        );

        req.on('error', (err: Error) => {
          reject(err);
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error('timeout'));
        });
      });
    },
  };

  /**
   * Verifica se o site Toongod está acessível.
   * 
   * Comportamento:
   * 1. Faz requisição para https://toongod.net
   * 2. O site retorna 302 redirect para http://ww17.toongod.net
   * 3. Segue o redirect e verifica se a resposta final é 200
   * 4. Retorna { available: true } se status for 200
   * 5. Retorna { available: false } para status 4xx/5xx ou erros
   * 
   * @returns Promise com { available: boolean }
   */
  async checkAvailability(): Promise<SiteAvailability> {
    try {
      // Tenta o domínio principal - este faz redirect
      const result = await this.makeRequest('https://toongod.net');

      if (result.finalStatus === 200) {
        return { available: true };
      }

      if (result.finalStatus >= 400) {
        // HTTP 4xx/5xx não é disponibilidade normal
        return { available: false };
      }

      // Outros status (301, 302, etc.) não são considerados disponíveis
      // na disponibilidade "normal"
      return { available: false };
    } catch {
      // Erro de rede, timeout ou qualquer exceção
      // não afeta a disponibilidade de forma positiva
      return { available: false };
    }
  }

  /**
   * Retorna informações do comic no Toongod.
   * 
   * @throws Error indicando que este método ainda não foi implementado
   */
  async getComicInfo(_comicUrl: string): Promise<ComicInfo> {
    throw new Error('getComicInfo not implemented yet - this is a incremental implementation');
  }

  /**
   * Retorna capítulos do comic no Toongod.
   * 
   * @throws Error indicando que este método ainda não foi implementado
   */
  async getChapters(_comicUrl: string): Promise<ChapterInfo[]> {
    throw new Error('getChapters not implemented yet - this is a incremental implementation');
  }

  /**
   * Faz uma requisição HTTP com tratamento de redirect e timeout.
   * 
   * @param url URL para acessar
   * @returns Resultado com status codes e informações do redirect
   */
  private async makeRequest(url: string): Promise<{
    finalStatus: number;
    redirected: boolean;
    redirectUrl?: string;
  }> {
    let finalStatus = 0;
    let redirected = false;
    let redirectUrl: string | undefined;
    let redirectDepth = 0;

    const followRedirects = async (currentUrl: string) => {
      if (redirectDepth >= 5) {
        return { finalStatus: 0, redirected: false };
      }

      const urlObj = new URL(currentUrl);
      const hostname = urlObj.hostname;
      const path = urlObj.pathname + urlObj.search;

      const response = await this.httpClient.get({
        hostname,
        path,
        timeout: this.timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      finalStatus = response.statusCode;

      // Verifica se precisa seguir redirect
      if (finalStatus === 302 || finalStatus === 301 || finalStatus === 303 || finalStatus === 307 || finalStatus === 308) {
        redirectDepth++;
        redirected = true;
        const location = response.headers['location'] || response.headers['Location'];
        if (location) {
          redirectUrl = new URL(location, currentUrl).href;
          return followRedirects(redirectUrl);
        }
      }

      // Resposta final - não é redirect
      return { finalStatus, redirected, redirectUrl: undefined };
    };

    return followRedirects(url);
  }
}

/**
 * Cria uma instância do ToongodAdapter registrada no registry.
 * 
 * @param registry Service do SiteAdapterRegistry
 * @param options Opções de registro
 * @param httpClient Cliente HTTP opcional para injeção de dependência
 * @returns O ToongodAdapter instanciado
 */
export function createToongodAdapter(
  registry: SiteAdapterRegistryService,
  options?: SiteAdapterRegistryOptions,
  httpClient?: HttpClient,
): ToongodAdapter {
  const adapter = new ToongodAdapter(options, httpClient);
  registry.registerAdapter('toongod', adapter);
  return adapter;
}