import type { DedupedArticle } from "../news/dedupe.js";
import type { DigestItem, Summarizer } from "./summarizer.js";
import { SYSTEM_PROMPT, buildUserPrompt, parsePicks, picksToDigestItems } from "./prompt.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

interface AnthropicResponse {
  content: { type: string; text?: string }[];
}

// Запасной провайдер: используем тот же промпт, что и Gemini, но вызываем
// Anthropic API напрямую через fetch, без отдельного SDK в зависимостях.
export class ClaudeSummarizer implements Summarizer {
  private readonly apiKey: string;
  private readonly modelName: string;

  constructor(apiKey: string, modelName = "claude-haiku-4-5-20251001") {
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY не задан");
    }
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async summarize(articles: DedupedArticle[]): Promise<DigestItem[]> {
    if (articles.length === 0) return [];

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: this.modelName,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(articles) }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API вернул ошибку ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as AnthropicResponse;
    const text = data.content.find((block) => block.type === "text")?.text ?? "";
    const picks = parsePicks(text);

    return picksToDigestItems(picks, articles);
  }
}
