import localFont from "next/font/local";

export const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-body",
  display: "swap",
  weight: "45 920",
  fallback: ["Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "sans-serif"],
});

export const cafe24Ssurround = localFont({
  src: "./fonts/Cafe24Ssurround.woff",
  variable: "--font-display",
  display: "swap",
  weight: "400",
  fallback: ["Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "sans-serif"],
});
