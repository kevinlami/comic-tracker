/**
 * Normalized comic information returned by any site adapter.
 * These types are independent of Prisma and represent the data after normalization.
 */
export interface ComicInfo {
  title: string;
  alternativeTitles?: string[];
  coverUrl?: string | null;
}

/**
 * Normalized chapter information returned by any site adapter.
 * The `number` field is a string to preserve decimal precision (Decimal(10,3)).
 * Examples: "1", "1.5", "10.125"
 */
export interface ChapterInfo {
  number: string;
  title?: string | null;
  url: string;
  publishedAt?: Date | null;
}

/**
 * Availability status returned by checkAvailability().
 */
export type SiteAvailability = {
  available: boolean;
};

/**
 * Error information from adapter operations.
 */
export type AdapterError = {
  code: string;
  message: string;
  source?: string;
};

/**
 * Configuration options for an adapter (minimal, extensible).
 */
export type AdapterOptions = {
  baseUrl: string;
  /** Optional timeout in milliseconds */
  timeoutMs?: number;
};