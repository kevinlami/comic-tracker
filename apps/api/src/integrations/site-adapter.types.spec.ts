import {
  ComicInfo,
  ChapterInfo,
  SiteAvailability,
  AdapterError,
} from './site-adapter.types';

describe('SiteAdapter Types', () => {
  it('should define ComicInfo with required fields', () => {
    const comic: ComicInfo = {
      title: 'Test Comic',
    };
    expect(comic.title).toBe('Test Comic');
    expect(comic.alternativeTitles).toBeUndefined();
    expect(comic.coverUrl).toBeUndefined();
  });

  it('should allow ComicInfo with all optional fields', () => {
    const comic: ComicInfo = {
      title: 'Test Comic',
      alternativeTitles: ['Alt 1', 'Alt 2'],
      coverUrl: 'https://example.com/cover.jpg',
    };
    expect(comic.title).toBe('Test Comic');
    expect(comic.alternativeTitles).toEqual(['Alt 1', 'Alt 2']);
    expect(comic.coverUrl).toBe('https://example.com/cover.jpg');
  });

  it('should define ChapterInfo with string number', () => {
    const chapter: ChapterInfo = {
      number: '1.5',
      title: 'Chapter 1.5',
      url: 'https://example.com/chapter/1.5',
      publishedAt: new Date('2024-01-15'),
    };
    expect(chapter.number).toBe('1.5');
    expect(chapter.title).toBe('Chapter 1.5');
    expect(chapter.url).toBe('https://example.com/chapter/1.5');
    expect(chapter.publishedAt).toBeInstanceOf(Date);
  });

  it('should allow ChapterInfo with null title and undefined publishedAt', () => {
    const chapter: ChapterInfo = {
      number: '1',
      title: null,
      url: 'https://example.com/chapter/1',
    };
    expect(chapter.number).toBe('1');
    expect(chapter.title).toBeNull();
    expect(chapter.url).toBe('https://example.com/chapter/1');
    expect(chapter.publishedAt).toBeUndefined();
  });

  it('should define SiteAvailability type', () => {
    const availability: SiteAvailability = { available: true };
    expect(availability.available).toBe(true);

    const unavailable: SiteAvailability = { available: false };
    expect(unavailable.available).toBe(false);
  });

  it('should define AdapterError type', () => {
    const error: AdapterError = {
      code: 'NETWORK_ERROR',
      message: 'Failed to connect',
      source: 'SiteAdapter.getChapters',
    };
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('Failed to connect');
    expect(error.source).toBe('SiteAdapter.getChapters');
  });
});