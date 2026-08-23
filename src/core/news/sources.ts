export interface NewsSource {
  id: string;
  name: string;
  url: string;
}

// Разные по редакционной позиции источники: официальная позиция МИД России,
// государственное и деловые российские СМИ, независимый западный взгляд.
export const sources: NewsSource[] = [
  { id: "mid", name: "МИД России", url: "https://mid.ru/ru/rss/" },
  { id: "abc-news", name: "ABC News", url: "https://abcnews.go.com/abcnews/topstories" },
  { id: "ria", name: "РИА Новости", url: "https://ria.ru/export/rss2/archive/index.xml" },
  { id: "rbc", name: "РБК", url: "https://rssexport.rbc.ru/rbcnews/news/30/full.rss" },
  { id: "vedomosti", name: "Ведомости", url: "https://www.vedomosti.ru/rss/news" },
];
