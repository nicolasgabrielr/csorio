import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: "/photos/**" },
      { pathname: "/photos/main/**" },
      { pathname: "/photos/gallery/**" },
    ],
    remotePatterns: [
      {
        // Supabase Storage — se usa cuando NEXT_PUBLIC_SUPABASE_URL está configurado
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
