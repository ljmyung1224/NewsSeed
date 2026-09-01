# Supabase 소셜 로그인 및 Vercel 배포 설정

## 1. Supabase 프로젝트

1. Supabase 프로젝트를 생성합니다.
2. SQL Editor에서 아래 migration을 이름 순서대로 실행합니다.
   - `supabase/migrations/202608290001_user_learning_state.sql`
   - `supabase/migrations/202608290002_user_preferences.sql`
   - `supabase/migrations/202608290003_personalization.sql`
   - `supabase/migrations/202609010004_daily_missions.sql`
   - `supabase/migrations/202609010005_user_seed_records.sql`
3. Project Settings → API에서 Project URL과 Publishable key를 확인합니다.
4. 로컬 `.env.local`과 Vercel 환경변수에 다음 값을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_SITE_URL=https://<production-domain>
```

Publishable key는 브라우저 사용을 전제로 한 공개 키입니다. 사용자 데이터는 SQL migration에 포함된 RLS 정책으로 보호됩니다. Service role key와 OAuth Client Secret은 앱 환경변수에 넣지 않습니다.

## 2. Supabase redirect URL

Authentication → URL Configuration에서 다음을 등록합니다.

- Site URL: `https://newsseed.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/**`
  - `https://newsseed.vercel.app/**`

## 3. Google

1. Google Cloud의 Google Auth Platform에서 Web OAuth Client를 만듭니다.
2. Authorized JavaScript origins에 로컬 주소와 운영 주소를 등록합니다.
3. Authorized redirect URI에는 Supabase Google Provider 화면에 표시되는 `https://<project-ref>.supabase.co/auth/v1/callback`을 등록합니다.
4. Client ID와 Client Secret을 Supabase Authentication → Providers → Google에 입력하고 활성화합니다.

앱의 로그인 버튼은 현재 브라우저 origin을 사용해 `/auth/callback`으로 돌아옵니다. 로컬과 운영 환경 모두 같은 코드 경로를 사용합니다.

## 4. Kakao

1. Kakao Developers에서 앱을 만들고 REST API key와 Client Secret을 준비합니다.
2. 제품 설정 → 카카오 로그인에서 활성화하고 OpenID Connect를 켭니다.
3. Redirect URI에는 Supabase Kakao Provider 화면에 표시되는 `https://<project-ref>.supabase.co/auth/v1/callback`을 등록합니다.
4. REST API key와 Client Secret을 Supabase Authentication → Providers → Kakao에 입력하고 활성화합니다.

## 5. 검증

```bash
npm run lint
npm run build
```

로그인 후 온보딩을 완료하고 기사를 읽은 다음 다음을 확인합니다.

1. `user_learning_state`에 해당 사용자 UUID의 XP와 학습 기록이 반영됩니다.
2. `user_seed_records`에 기사 제목, 카테고리, 원문 URL, 완료 시각, XP, 퀴즈 상태 및 `article_snapshot`이 저장됩니다.
3. 동일 기사를 같은 날 다시 완료해도 `(user_id, article_id, completed_on)` 기준으로 행이 하나만 유지됩니다.
4. 다른 브라우저에서 같은 계정으로 로그인하면 씨앗 보관함에 같은 기록이 표시되고, 항목을 눌러 저장 당시 기사 내용을 다시 열 수 있습니다.
5. 다른 사용자로 로그인했을 때 해당 기록이 조회되지 않아야 합니다(RLS 확인).
