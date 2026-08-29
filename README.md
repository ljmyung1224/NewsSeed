# 뉴씨드 (NewsSeed)

> 하루 한 장, 생각이 자라는 뉴스

뉴씨드는 어린이가 매일 자신의 관심사와 읽기 수준에 맞는 뉴스를 읽고, 낱말과 퀴즈를 통해 세상을 배우는 1일 1신문 학습 서비스입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

외부 서비스 없이도 Mock 기사 fallback으로 완전한 학습 흐름이 동작합니다. 실제 뉴스·AI 연동을 준비하려면 `.env.example`을 복사해 `.env.local`을 만들고 서버 전용 키를 설정하세요.

## 실제 뉴스 파이프라인

`NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `GEMINI_API_KEY`가 모두 설정되면 NAVER API HUB의 뉴스 검색 API에서 최신 뉴스 메타데이터를 수집하고 Gemini로 학년별 교육 콘텐츠를 생성합니다. 하나라도 없거나 외부 요청·변환이 실패하면 자동으로 Mock 기사로 돌아갑니다. 원문 전체는 수집하거나 재게시하지 않습니다.

상세 구조와 설정 방법은 [`docs/NEWS_PIPELINE.md`](docs/NEWS_PIPELINE.md)를 참고하세요.

## 소셜 로그인과 개인별 기록

Supabase Auth를 통해 Google·Kakao 로그인을 지원합니다. Supabase 환경변수가 없으면 개발 편의를 위해 기존 localStorage 모드로 동작합니다. 환경변수를 설정하면 로그인이 필수가 되고, 온보딩 정보와 XP, streak, 기사 완료 기록이 사용자 계정별로 동기화됩니다.

설정 및 Vercel 배포 절차는 [`docs/AUTH_DEPLOYMENT.md`](docs/AUTH_DEPLOYMENT.md)를 참고하세요.

## 콘텐츠 원칙

실제 뉴스 원문을 재게시하지 않습니다. 원문의 사실과 주제를 바탕으로 어린이용 교육 콘텐츠를 새롭게 구성하고, 원문 출처와 링크를 표시합니다.
