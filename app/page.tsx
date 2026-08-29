import { NewseedApp } from "@/features/app/newseed-app";
import { getDailyNews } from "@/services/news/getDailyNews";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function Home() {
  const articles = await getDailyNews({ live: false });
  return <NewseedApp initialArticles={articles} authEnabled={isSupabaseConfigured()} />;
}
