import { SeedsScreen } from "@/features/seeds/seeds-screen";
import { isSupabaseConfigured } from "@/lib/supabase/config";
export default function SeedsPage() { return <SeedsScreen authEnabled={isSupabaseConfigured()} />; }
