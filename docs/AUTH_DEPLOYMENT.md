# Supabase 소셜 로그인 및 Vercel 배포 설정

## 1. Supabase 프로젝트

1. Supabase 프로젝트를 생성합니다.
2. SQL Editor에서 `supabase/migrations/202608290001_user_learning_state.sql`을 실행합니다.
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

로그인 후 온보딩을 완료하고 기사를 읽은 다음, Supabase Table Editor의 `user_learning_state`에서 해당 사용자 UUID의 XP와 학습 기록이 반영되는지 확인합니다.
