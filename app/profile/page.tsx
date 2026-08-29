import { ProfileScreen } from "@/features/profile/profile-screen";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ProfilePage() {
  return <ProfileScreen authEnabled={isSupabaseConfigured()}/>;
}
