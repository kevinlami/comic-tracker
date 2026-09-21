/**
 * Registry/factory for resolving SiteAdapter instances by Site.
 * 
 * This service maintains a mapping of site identifiers (name or baseUrl)
 * to their corresponding adapter implementations.
 * 
 * It follows the Factory pattern and is compatible with NestJS dependency injection.
 * 
 * IMPORTANT: This is the infrastructure layer only. Concrete adapter implementations
 * (SiteAAdapter, SiteBAdapter, etc.) must be registered here for this to work.
 * 
 * Currently, this registry has no concrete adapters registered. When a concrete
 * adapter is created for a specific site, it should be registered in this service.
 */
import { Injectable } from '@nestjs/common';
import { SiteAdapter } from './site-adapter.interface';

/**
 * Options passed to the registry when resolving an adapter.
 */
export type SiteAdapterRegistryOptions = {
  /** The site identifier to look up (typically the site name) */
  siteIdentifier: string;
  /** Optional override for the base URL */
  baseUrl?: string;
  /** Optional timeout in milliseconds */
  timeoutMs?: number;
};

/**
 * Result of resolving an adapter for a given site.
 */
export type SiteAdapterResolution = {
  /** The resolved adapter instance */
  adapter: SiteAdapter | null;
  /** The site that was used for resolution */
  site: string;
  /** Whether the adapter was found */
  found: boolean;
  /** Error message if not found */
  error?: string;
};

/**
 * Registry service that maps sites to their adapters.
 * 
 * This service maintains a mapping of site identifiers (name or baseUrl)
 * to their corresponding adapter implementations.
 * 
 * Uses NestJS dependency injection. Concrete adapters should be registered
 * as providers and this service should be updated accordingly.
 */
@Injectable()
export class SiteAdapterRegistryService {
  /**
   * Internal map of site identifiers to adapter instances.
   * In a real implementation, these would be injected via NestJS DI.
   */
  private adapters: Map<string, SiteAdapter> = new Map();

  /**
   * Register an adapter for a specific site.
   * 
   * @param siteIdentifier The site name or identifier
   * @param adapter The adapter instance
   */
  registerAdapter(siteIdentifier: string, adapter: SiteAdapter): void {
    this.adapters.set(siteIdentifier, adapter);
  }

  /**
   * Resolve an adapter for the given site identifier.
   * 
   * @param siteIdentifier The site name or identifier to look up
   * @param options Optional configuration options
   * @returns Resolution result with adapter or error
   */
  resolveAdapter(
    siteIdentifier: string,
    _options?: SiteAdapterRegistryOptions,
  ): SiteAdapterResolution {
    const adapter = this.adapters.get(siteIdentifier);

    if (adapter) {
      return {
        adapter,
        site: siteIdentifier,
        found: true,
      };
    }

    return {
      adapter: null,
      site: siteIdentifier,
      found: false,
      error: `No adapter registered for site: "${siteIdentifier}"`,
    };
  }

  /**
   * Check if an adapter exists for the given site identifier.
   * 
   * @param siteIdentifier The site name or identifier to check
   * @returns True if an adapter is registered
   */
  hasAdapter(siteIdentifier: string): boolean {
    return this.adapters.has(siteIdentifier);
  }

  /**
   * Get all registered site identifiers.
   * 
   * @returns Array of registered site identifiers
   */
  getRegisteredSites(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Get the adapter based on a site configuration object.
   * 
   * This method looks up the adapter based on the site's name or baseUrl.
   * 
   * @param site The site configuration with name and baseUrl
   * @returns Resolution result
   */
  getAdapterForSite(site: { name: string; baseUrl: string }): SiteAdapterResolution {
    // First try by name
    const byName = this.resolveAdapter(site.name);

    if (byName.found) {
      return byName;
    }

    // Try by baseUrl (last part of the URL)
    const baseUrlIdentifier = site.baseUrl
      .replace('https://', '')
      .replace('http://', '');

    const byUrl = this.resolveAdapter(baseUrlIdentifier);

    if (byUrl.found) {
      return byUrl;
    }

    return {
      adapter: null,
      site: site.name,
      found: false,
      error: `No adapter registered for site: "${site.name}" (${site.baseUrl})`,
    };
  }
}