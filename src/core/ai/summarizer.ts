import type { DedupedArticle } from "../news/dedupe.js";

export interface DigestItem {
  title: string;
  summary: string;
  sources: { sourceName: string; link: string }[];
}

export interface Summarizer {
  summarize(articles: DedupedArticle[]): Promise<DigestItem[]>;
}
