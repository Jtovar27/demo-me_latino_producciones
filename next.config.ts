import type { NextConfig } from "next";

// Content-Security-Policy tuned to what this app actually loads:
//  - scripts/styles: self + inline (Next.js injects inline bootstrap; Tailwind/next-font inline styles).
//    No external script hosts are used. ('unsafe-inline' is retained because the app has no
//    dangerouslySetInnerHTML/eval sinks and all DB-sourced hrefs are sanitized; a nonce-based
//    policy is the documented future hardening.)
//  - images: Supabase public storage + Unsplash + YouTube thumbnails + data/blob.
//  - connect: same-origin + Supabase (browser anon client / form submissions).
//  - frames: YouTube + Vimeo embeds (VideoPlayer).
//  - framing of THIS site: denied (clickjacking protection for the admin login and everything else).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://i.ytimg.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "media-src 'self' blob: https://*.supabase.co",
  "frame-src https://www.youtube.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        // Scoped to public storage objects only — not an open optimizer for arbitrary Supabase paths.
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Admin and auth surfaces must never be cached by a shared CDN.
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
