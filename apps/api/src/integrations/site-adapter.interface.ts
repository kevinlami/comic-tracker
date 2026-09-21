/**
 * Types imported from site-adapter.types for the SiteAdapter interface.
 */
import {
  ComicInfo,
  ChapterInfo,
} from './site-adapter.types';

/**
 * Interface that all site adapters must implement.
 * 
 * This abstraction allows the application to work with any external manga site
 * without depending on the specific implementation details of each site.
 * 
 * The adapter only normalizes data - it does NOT persist to the database,
 * does NOT make real HTTP calls (those are the responsibility of concrete adapters),
 * and does NOT know about Prisma.
 */
export interface SiteAdapter {
  /**
   * Check if the site is accessible/available.
   * 
   * @returns Normalized availability information
   */
  checkAvailability(): Promise<{
    available: boolean;
  }>;

  /**
   * Get comic information from the external site.
   * 
   * @param comicUrl URL of the comic on the external site
   * @returns Normalized comic data (title, alternativeTitles, coverUrl)
   * 
   * @throws {Error} If the comic cannot be found or the site is inaccessible
   */
  getComicInfo(comicUrl: string): Promise<ComicInfo>;

  /**
   * Get a list of chapters from the external comic.
   * 
   * @param comicUrl URL of the comic on the external site
   * @returns Normalized list of chapters with number, title, url and publishedAt
   * 
   * @throws {Error} If the chapters cannot be retrieved
   */
  getChapters(comicUrl: string): Promise<ChapterInfo[]>;
}