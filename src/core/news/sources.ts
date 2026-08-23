export interface NewsSource {
  id: string;
  name: string;
  url: string;
}

// Разные по редакционной позиции источники: независимое медиа,
// государственное СМИ, зарубежная редакция на русском.
export const sources: NewsSource[] = [
  { id: "meduza", name: "Meduza", url: "https://meduza.io/rss/all" },
  { id: "rt", name: "RT на русском", url: "https://russian.rt.com/rss" },
  { id: "bbc-russian", name: "BBC Russian", url: "https://feeds.bbci.co.uk/russian/rss.xml" },
];
