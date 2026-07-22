import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const githubRepository = process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const [githubOwner = "", githubRepositoryName = ""] = githubRepository;
const isGithubProjectPage =
  process.env.GITHUB_PAGES === "true" &&
  githubRepositoryName.length > 0 &&
  githubRepositoryName.toLowerCase() !== `${githubOwner.toLowerCase()}.github.io`;
const publicBasePath = isGithubProjectPage ? `/${githubRepositoryName}` : "";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "固收+组合透视｜三只基金季报与持仓演变",
  description: "基于2025Q2至2026Q2季报，对比易方达增强回报、西部利得汇享与中银国有企业债的业绩、仓位和风险来源。",
  icons: {
    icon: `${publicBasePath}/favicon.svg`,
    shortcut: `${publicBasePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
