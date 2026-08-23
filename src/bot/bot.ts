import { Bot, Keyboard, type Context } from "grammy";
import { formatDigest, type DigestApiItem } from "./format.js";

interface DigestApiResponse {
  date: string;
  cached: boolean;
  items: DigestApiItem[];
}

const TODAY_BUTTON_TEXT = "Сводка за сегодня";

export function createBot(token: string, apiBaseUrl: string) {
  const bot = new Bot(token);
  const keyboard = new Keyboard().text(TODAY_BUTTON_TEXT).resized();

  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Привет! Я присылаю короткую сводку новостей из источников с разной редакционной позицией.\n\n" +
        "Нажми кнопку ниже, чтобы получить сводку за сегодня.",
      { reply_markup: keyboard },
    );
  });

  bot.command("today", sendDigest);
  bot.hears(TODAY_BUTTON_TEXT, sendDigest);

  async function sendDigest(ctx: Context) {
    await ctx.reply("Собираю сводку, минутку...");

    try {
      const response = await fetch(`${apiBaseUrl}/digest/today`);
      if (!response.ok) {
        throw new Error(`API вернул ${response.status}`);
      }

      const data = (await response.json()) as DigestApiResponse;
      await ctx.reply(formatDigest(data.items), {
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      });
    } catch (err) {
      console.error("[bot] Не удалось получить сводку:", err);
      await ctx.reply("Не получилось собрать сводку, попробуй чуть позже.");
    }
  }

  return bot;
}
