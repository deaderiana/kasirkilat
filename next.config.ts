import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Ubah jadi Static Export (Wajib untuk Capacitor/Mobile App)
  output: 'export',
  
  // 2. Matikan Optimasi Gambar (Karena di HP tidak ada server Next.js buat optimasi gambar)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;