import { fetchAllArticles } from "./news/fetcher.js";
import { dedupeArticles } from "./news/dedupe.js";
import type { DigestItem, Summarizer } from "./ai/summarizer.js";

export async function buildDigest(summarizer: Summarizer): Promise<DigestItem[]> {
  const articles = await fetchAllArticles();
  const deduped = dedupeArticles(articles);
  return summarizer.summarize(deduped);
}
