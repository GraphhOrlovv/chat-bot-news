import "dotenv/config";
import { buildApiServer } from "./core/api.js";
import { createBot } from "./bot/bot.js";
import { scheduleDailyDigest } from "./bot/scheduler.js";

async function main() {
  const app = buildApiServer();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ port, host: "0.0.0.0" });

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    console.warn("BOT_TOKEN не задан — бот не запущен, работает только REST API");
    return;
  }

  const apiBaseUrl = `http://127.0.0.1:${port}`;
  const bot = createBot(botToken, apiBaseUrl);
  bot
    .start({ onStart: (info) => console.log(`Бот @${info.username} запущен`) })
    .catch((err) => console.error("Ошибка бота:", err));

  const myChatId = process.env.MY_CHAT_ID;
  if (!myChatId) {
    console.warn("MY_CHAT_ID не задан — ежедневная рассылка не запланирована");
    return;
  }

  const cronExpression = process.env.DIGEST_CRON ?? "0 9 * * *";
  const timezone = process.env.DIGEST_TIMEZONE ?? "Europe/Moscow";
  scheduleDailyDigest(bot, apiBaseUrl, myChatId, cronExpression, timezone);
}

main().catch((err) => {
  console.error("Ошибка запуска:", err);
  process.exit(1);
});
