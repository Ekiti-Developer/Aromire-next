/** @type {import('next').NextConfig} */

// Origins the app legitimately loads. Kept in one place so the CSP and the
// image loader cannot drift apart.
const SANITY_ORIGINS = "https://sanity.io https://*.sanity.io";
const SANITY_CDN = "https://core.sanity-cdn.com";
const VIDEO_FRAME_ORIGINS =
  "https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com";

// React's development build uses eval() for its debugging tools. It never does
// in production, so only relax script-src while running `next dev`.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = [
  "'self'",
  "'unsafe-inline'", // Next.js inline bootstrap scripts
  ...(isDev ? ["'unsafe-eval'"] : []),
  SANITY_CDN, // official Sanity Studio bridge script
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  // Sanity previews use blob: object URLs and data: thumbnails.
  `img-src 'self' data: blob: https://cdn.sanity.io https://i.ytimg.com`,
  "font-src 'self' data:",
  // Studio talks to the Sanity API over HTTPS and WebSockets.
  `connect-src 'self' ${SANITY_ORIGINS} ${SANITY_CDN} wss://*.sanity.io`,
  `frame-src 'self' ${VIDEO_FRAME_ORIGINS}`,
  "media-src 'self' blob: https://cdn.sanity.io",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), " +
      "accelerometer=(), gyroscope=(), magnetometer=(), autoplay=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000",
  },
];

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    agentUpgrade: "security",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
