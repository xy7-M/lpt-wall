import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出：next build 产出 out/ 目录，可直接部署到 Cloudflare Pages / 任何 CDN
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;