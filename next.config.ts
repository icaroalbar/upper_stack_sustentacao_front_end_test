import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upper-stack-sustentacao.s3.us-east-1.amazonaws.com",
        pathname: "/imagens-front/**",
      },
    ],
  },
};

export default nextConfig;
