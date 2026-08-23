import type { DedupedArticle } from "../news/dedupe.js";
import type { DigestItem } from "./summarizer.js";

export const SYSTEM_PROMPT =
  "Ты — редактор нейтральной новостной сводки. Тебе дают список заголовков новостей " +
  "из источников с разной редакционной позицией. Выбери 5 самых значимых и разноплановых " +
  "новостей (не только про один регион или тему) и для каждой напиши краткое нейтральное " +
  "изложение сути в 1-2 предложениях, без оценочных слов и без пересказа позиции конкретного " +
  "источника. Отвечай строго в формате JSON-массива без markdown-разметки и пояснений: " +
  '[{"index": <номер новости из списка>, "summary": "<краткое изложение>"}, ...]. Ровно 5 элементов.';

export function buildUserPrompt(articles: DedupedArticle[]): string {
  const list = articles
    .map((article, index) => {
      const sourceNames = article.sources.map((s) => s.sourceName).join(", ");
      const snippet = article.snippet ? ` — ${article.snippet}` : "";
      return `${index}. [${sourceNames}] ${article.title}${snippet}`;
    })
    .join("\n");

  return `Список новостей:\n${list}`;
}

export interface SummaryPick {
  index: number;
  summary: string;
}

// Модели иногда оборачивают JSON в ```json ... ``` — срезаем такие обёртки перед парсингом.
export function parsePicks(rawText: string): SummaryPick[] {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error("Ответ ИИ не является JSON-массивом");
  }

  return parsed
    .filter(
      (item): item is SummaryPick =>
        typeof item === "object" &&
        item !== null &&
        typeof item.index === "number" &&
        typeof item.summary === "string",
    )
    .map((item) => ({ index: item.index, summary: item.summary.trim() }));
}

// Ссылки и источники берём из наших же данных, а не из ответа ИИ — так в сводке
// не может оказаться выдуманная ссылка.
export function picksToDigestItems(picks: SummaryPick[], articles: DedupedArticle[]): DigestItem[] {
  return picks
    .map(({ index, summary }): DigestItem | null => {
      const article = articles[index];
      if (!article) return null;
      return {
        title: article.title,
        summary,
        sources: article.sources.map((s) => ({ sourceName: s.sourceName, link: s.link })),
      };
    })
    .filter((item): item is DigestItem => item !== null)
    .slice(0, 5);
}
