import { schedule } from "node-cron";
import type { Bot } from "grammy";
import { formatDigest, type DigestApiItem } from "./format.js";

interface DigestApiResponse {
  date: string;
  cached: boolean;
  items: DigestApiItem[];
}

export function scheduleDailyDigest(
  bot: Bot,
  apiBaseUrl: string,
  chatId: string,
  cronExpression: string,
  timezone: string,
) {
  schedule(
    cronExpression,
    async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/digest/today`);
        if (!response.ok) {
          throw new Error(`API вернул ${response.status}`);
        }

        const data = (await response.json()) as DigestApiResponse;
        await bot.api.sendMessage(chatId, formatDigest(data.items), {
          parse_mode: "HTML",
          link_preview_options: { is_disabled: true },
        });
      } catch (err) {
        console.error("[scheduler] Не удалось отправить ежедневную сводку:", err);
      }
    },
    { timezone },
  );

  console.log(`Ежедневная рассылка запланирована: "${cronExpression}" (${timezone})`);
}
