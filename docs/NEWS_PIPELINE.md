# 실제 뉴스 콘텐츠 파이프라인

## 환경변수

`.env.example`을 복사해 `.env.local`을 만들고 다음 서버 전용 키를 설정합니다.

```env
NAVER_CLIENT_ID=<NAVER API HUB Client ID>
NAVER_CLIENT_SECRET=<NAVER API HUB Client Secret>
GEMINI_API_KEY=<Gemini API key>
```

두 키에는 `NEXT_PUBLIC_`을 붙이지 않습니다. 배포 시에는 같은 이름으로 Vercel Environment Variables에 등록합니다.

## 데이터 흐름

1. 클라이언트가 온보딩에서 선택한 학년, 관심사, 읽기 수준, 설명 난이도, 하루 기사 수를 `/api/daily-news`에 전달합니다.
2. 서버의 NAVER API HUB adapter가 최신 뉴스에서 제목, 짧은 설명, 원문 URL, 언론사, 발행일만 가져옵니다.
3. URL과 제목으로 중복 후보를 제거하고 규칙 기반 어린이 안전 필터를 통과시킵니다.
4. 하루 기사 수가 1개이면 관심 기사 1개, 2~5개이면 관심 기사 N-1개와 탐색 기사 1개가 되도록 후보를 배치합니다.
5. URL+학년+읽기 수준+설명 난이도 캐시에 기존 생성 결과가 있는지 확인합니다.
6. 캐시 miss만 Gemini의 구조화 JSON 출력으로 변환합니다.
7. 완성된 `Article`을 반환하며 기사 화면에는 언론사, 원문 제목, 발행일, 원문 링크를 표시합니다.

현재 캐시는 서버 프로세스 안에서 24시간 유지됩니다. `ArticleContentCache` 인터페이스의 구현체만 교체하면 Supabase나 Redis 영구 캐시를 사용할 수 있습니다. 동시에 같은 기사와 동일한 개인화 조합을 요청하면 single-flight 처리로 Gemini 요청을 한 번만 실행합니다.

`evaluateArticleSafety.ts`는 현재 키워드 기반 필터이며 `ArticleSafetyEvaluator` 인터페이스를 통해 향후 별도 안전 분류기를 연결할 수 있습니다.

## fallback

다음 경우 전체 결과를 `mockArticles`로 대체합니다.

- NAVER API HUB 자격 증명 또는 `GEMINI_API_KEY`가 없음
- NAVER API HUB 오류, timeout 또는 결과 없음
- AI 거절, 불충분한 메타데이터, 스키마 검증 실패
- 사용자가 고른 수만큼 안전한 콘텐츠를 완성하지 못함

외부 기사 본문은 다운로드하거나 DB에 저장하지 않습니다.
