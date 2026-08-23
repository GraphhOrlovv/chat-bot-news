import Parser from "rss-parser";
import { sources, type NewsSource } from "./sources.js";

export interface Article {
  title: string;
  link: string;
  sourceId: string;
  sourceName: string;
  publishedAt: string | undefined;
  snippet: string | undefined;
}

const parser = new Parser();

async function fetchSource(source: NewsSource): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items ?? [])
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.trim(),
        link: item.link!,
        sourceId: source.id,
        sourceName: source.name,
        publishedAt: item.isoDate ?? item.pubDate,
        snippet: item.contentSnippet?.trim(),
      }));
  } catch (err) {
    console.error(`[fetcher] Не удалось получить фид "${source.name}" (${source.url}):`, err);
    return [];
  }
}

export async function fetchAllArticles(feedSources: NewsSource[] = sources): Promise<Article[]> {
  const results = await Promise.all(feedSources.map(fetchSource));
  return results.flat();
}
