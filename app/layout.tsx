import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SVG Math Image Editor",
  description: "수학 함수와 도형을 그릴 수 있는 SVG 에디터",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
