import type { NextConfig } from "next";

const githubRepository = process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const [githubOwner = "", githubRepositoryName = ""] = githubRepository;
const isGithubPages = process.env.GITHUB_PAGES === "true";
const isUserOrOrganizationPage =
  githubRepositoryName.toLowerCase() === `${githubOwner.toLowerCase()}.github.io`;
const githubPagesBasePath =
  isGithubPages && githubRepositoryName && !isUserOrOrganizationPage
    ? `/${githubRepositoryName}`
    : "";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: "export",
        trailingSlash: true,
        basePath: githubPagesBasePath,
        assetPrefix: githubPagesBasePath,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
