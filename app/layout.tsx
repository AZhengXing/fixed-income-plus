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
  title: "固收增强研究档案｜季度业绩、持仓与结构变化",
  description: "基于2025Q2至2026Q2法定季报，持续跟踪易方达增强回报、西部利得汇享与中银国有企业债的业绩、资产结构和已披露持仓变化。",
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
