/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // ▼▼▼ 元に戻す（開発中はPWAを無効化して軽快にする） ▼▼▼
  disable: process.env.NODE_ENV === 'development', 
  buildExcludes: [/middleware-manifest\.json$/],
})(nextConfig);