import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The console is served behind the Arena preview proxy and at ai.uarea.in.
  // Allow dev-origin access from either host without Next's dev warnings.
  allowedDevOrigins: ["*.e2b.app", "ai.uarea.in", "*.uarea.in"],
  eslint: { ignoreDuringBuilds: true },
  // The repo has a lockfile at the parent level too — pin tracing to this app.
  outputFileTracingRoot: process.cwd(),
  serverExternalPackages: ["mysql2"],
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
