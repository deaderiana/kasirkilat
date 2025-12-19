import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

// 1. Inisialisasi Konfigurasi PWA
const withPWA = withPWAInit({
  dest: "public",         // Folder output
  register: true,         // Auto register service worker
  skipWaiting: true,      // Auto update jika ada versi baru
  disable: process.env.NODE_ENV === "development", // PWA mati saat coding
});

// 2. Konfigurasi Next.js Anda (Static Export)
const nextConfig: NextConfig = {
  // Wajib untuk Capacitor/Mobile App (menghasilkan folder 'out')
  output: 'export',
  
  // Matikan Optimasi Gambar (Wajib jika pakai output: 'export')
  images: {
    unoptimized: true,
    // Kita tetap tambahkan ini agar Next.js tau domain mana yang aman
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

// 3. Gabungkan keduanya dengan export default
export default withPWA(nextConfig);