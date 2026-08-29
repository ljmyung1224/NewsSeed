import type { Metadata } from "next";
import "./globals.css";
import { cafe24Ssurround, pretendard } from "./fonts";

export const metadata: Metadata = {
  title: "뉴씨드 | 하루 한 장, 생각이 자라는 뉴스",
  description: "어린이를 위한 개인화 1일 1신문 학습 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${cafe24Ssurround.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
