import Fastify from "fastify";
import { createSummarizer } from "./ai/index.js";
import { buildDigest } from "./digest.js";
import type { DigestItem } from "./ai/summarizer.js";

interface DigestCache {
  date: string;
  items: DigestItem[];
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildApiServer() {
  const app = Fastify({ logger: true });
  const summarizer = createSummarizer();

  let cache: DigestCache | null = null;
  // Пока сводка на сегодня считается, повторные клики не должны запускать ИИ ещё раз.
  let pending: Promise<DigestItem[]> | null = null;

  app.get("/health", async () => ({ status: "ok" }));

  app.get("/digest/today", async () => {
    const key = todayKey();

    if (cache && cache.date === key) {
      return { date: key, cached: true, items: cache.items };
    }

    if (!pending) {
      pending = buildDigest(summarizer).finally(() => {
        pending = null;
      });
    }

    let items: DigestItem[];
    try {
      items = await pending;
    } catch (err) {
      app.log.error(err, "Не удалось собрать сводку");
      const error = new Error("Сводка временно недоступна, попробуйте позже");
      (error as { statusCode?: number }).statusCode = 503;
      throw error;
    }

    cache = { date: key, items };
    return { date: key, cached: false, items };
  });

  return app;
}
