import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DedupedArticle } from "../news/dedupe.js";
import type { DigestItem, Summarizer } from "./summarizer.js";
import { SYSTEM_PROMPT, buildUserPrompt, parsePicks, picksToDigestItems } from "./prompt.js";

export class GeminiSummarizer implements Summarizer {
  private readonly client: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(apiKey: string, modelName = "gemini-3.6-flash") {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY не задан");
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async summarize(articles: DedupedArticle[]): Promise<DigestItem[]> {
    if (articles.length === 0) return [];

    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: SYSTEM_PROMPT,
    });
    const result = await model.generateContent(buildUserPrompt(articles));
    const picks = parsePicks(result.response.text());

    return picksToDigestItems(picks, articles);
  }
}
