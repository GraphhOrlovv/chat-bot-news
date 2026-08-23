import type { Summarizer } from "./summarizer.js";
import { GeminiSummarizer } from "./geminiSummarizer.js";
import { ClaudeSummarizer } from "./claudeSummarizer.js";

export type { Summarizer, DigestItem } from "./summarizer.js";

// Провайдер выбирается через AI_PROVIDER в .env — переключение между Gemini
// и Claude не требует правок остального кода (digest.ts, bot).
export function createSummarizer(): Summarizer {
  const provider = (process.env.AI_PROVIDER ?? "gemini").toLowerCase();

  switch (provider) {
    case "gemini":
      return new GeminiSummarizer(process.env.GEMINI_API_KEY ?? "");
    case "claude":
      return new ClaudeSummarizer(process.env.ANTHROPIC_API_KEY ?? "");
    default:
      throw new Error(`Неизвестный AI_PROVIDER: "${provider}" (ожидается "gemini" или "claude")`);
  }
}
