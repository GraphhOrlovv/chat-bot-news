import type { Article } from "./fetcher.js";

export interface DedupedArticle {
  title: string;
  link: string;
  publishedAt: string | undefined;
  snippet: string | undefined;
  sources: { sourceId: string; sourceName: string; link: string }[];
}

function normalize(title: string): string {
  return title
    .toLowerCase()
    .replace(/[«»"'.,!?:;()\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(title: string): Set<string> {
  return new Set(normalize(title).split(" ").filter((word) => word.length > 2));
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return intersection / union;
}

// Схлопывает заголовки о том же событии из разных источников по
// пересечению слов в заголовке (без ИИ, чисто текстовое сравнение).
export function dedupeArticles(articles: Article[], threshold = 0.5): DedupedArticle[] {
  const clusters: { tokens: Set<string>; article: DedupedArticle }[] = [];

  for (const article of articles) {
    const tokens = tokenize(article.title);
    const cluster = clusters.find((c) => jaccardSimilarity(c.tokens, tokens) >= threshold);

    if (cluster) {
      cluster.article.sources.push({
        sourceId: article.sourceId,
        sourceName: article.sourceName,
        link: article.link,
      });
    } else {
      clusters.push({
        tokens,
        article: {
          title: article.title,
          link: article.link,
          publishedAt: article.publishedAt,
          snippet: article.snippet,
          sources: [{ sourceId: article.sourceId, sourceName: article.sourceName, link: article.link }],
        },
      });
    }
  }

  return clusters.map((c) => c.article);
}
