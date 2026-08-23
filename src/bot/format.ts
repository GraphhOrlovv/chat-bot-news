export interface DigestApiItem {
  title: string;
  summary: string;
  sources: { sourceName: string; link: string }[];
}

export function formatDigest(items: DigestApiItem[]): string {
  if (items.length === 0) {
    return "Сегодня подходящих новостей не нашлось.";
  }

  return items
    .map((item, i) => {
      const sources = item.sources
        .map((s) => `<a href="${s.link}">${escapeHtml(s.sourceName)}</a>`)
        .join(", ");
      return `<b>${i + 1}. ${escapeHtml(item.title)}</b>\n${escapeHtml(item.summary)}\n${sources}`;
    })
    .join("\n\n");
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
