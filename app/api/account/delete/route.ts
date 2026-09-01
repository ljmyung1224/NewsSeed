import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE() {
  const userClient = await createSupabaseServerClient();
  if (!userClient) return NextResponse.json({ error: "Supabase가 설정되지 않았습니다." }, { status: 503 });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "로그인된 사용자를 찾을 수 없습니다." }, { status: 401 });

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return NextResponse.json({ error: "회원탈퇴 기능을 사용하려면 서버 설정이 필요합니다." }, { status: 503 });

  const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("[NewsSeed][Account][delete] Supabase user deletion failed.", deleteError.message);
    return NextResponse.json({ error: "회원탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }

  await userClient.auth.signOut();
  return NextResponse.json({ ok: true });
}
