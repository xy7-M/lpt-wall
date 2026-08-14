import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LPT 留言墙",
  description: "把手账里的留言贴到墙上",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
