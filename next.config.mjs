/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  // ここに将来的なNext.jsの設定を追加できます
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // 開発中はPWAを無効化
})(nextConfig);