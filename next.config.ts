import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Content-Security-Policy — primary XSS defense
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js inline scripts + Google Fonts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Tailwind inline styles + Google Fonts stylesheets
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Google Fonts & Material Symbols font files
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + allowed external hosts
      "img-src 'self' data: blob: https://lh3.googleusercontent.com https://images.unsplash.com https://images.pexels.com",
      // API calls, WebSocket HMR in dev
      "connect-src 'self' ws://localhost:* wss://localhost:*",
      // No plugins, no frames from foreign origins
      "object-src 'none'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },

  async headers() {
    return [
      {
        // Apply security headers to every route
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },


  // Strict mode helps catch issues early
  reactStrictMode: true,
};

export default nextConfig;
