import { NewseedApp } from "@/features/app/newseed-app";
import { mockArticles } from "@/data/mockArticles";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function Home() {
  return <NewseedApp initialArticles={mockArticles.slice(0, 3)} authEnabled={isSupabaseConfigured()} />;
}
