import "dotenv/config";
import { buildDigest } from "../core/digest.js";
import { createSummarizer } from "../core/ai/index.js";

async function main() {
  console.log("Собираю сводку новостей...\n");

  const summarizer = createSummarizer();
  const digest = await buildDigest(summarizer);

  console.log(`Готово, пунктов в сводке: ${digest.length}\n`);

  digest.forEach((item, i) => {
    const sourceNames = item.sources.map((s) => s.sourceName).join(", ");
    console.log(`${i + 1}. ${item.title}`);
    console.log(`   ${item.summary}`);
    console.log(`   Источники: ${sourceNames}\n`);
  });
}

main().catch((err) => {
  console.error("Ошибка запуска:", err);
  process.exit(1);
});
