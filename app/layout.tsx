import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 1. CONFIG VIEWPORT (Khusus Tampilan HP/PWA)
// Ini dipisah dari metadata di Next.js versi terbaru
export const viewport: Viewport = {
  themeColor: "#10b981", // Warna Hijau Emerald (Sesuai Brand)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Mencegah user zoom-cubit (Biar terasa seperti aplikasi Native)
  userScalable: false,
};

// 2. METADATA (SEO & Identitas Aplikasi)
export const metadata: Metadata = {
  // Judul Halaman
  title: {
    default: "Kasir KilatQu | Aplikasi Kasir & WMS Gudang UMKM",
    template: "%s | Kasir KilatQu"
  },
  description: "Aplikasi kasir online gratis dengan fitur stok gudang (WMS), kirim struk WhatsApp, dan laporan keuangan. Solusi terbaik untuk warung dan UMKM.",
  
  // Kata Kunci untuk Google
  keywords: ["aplikasi kasir gratis", "kasir wms", "stok gudang", "kasir toko kelontong", "cetak struk bluetooth", "kasir kilatqu", "pos system indonesia"],
  
  // Penulis
  authors: [{ name: "Kasir KilatQu Team" }],
  creator: "Kasir KilatQu",
  
  // PWA Manifest (KTP Aplikasi)
  manifest: "/manifest.json",
  
  // Ikon Aplikasi
  icons: {
    icon: "/icon-192.png",      // Ikon di Tab Browser
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",     // Ikon di iPhone/iPad
  },

  // OpenGraph (Tampilan saat link disebar di WA/FB)
  openGraph: {
    title: "Kasir KilatQu - Kasir & WMS Gratis",
    description: "Kelola stok gudang, kasir, dan keuangan dalam satu aplikasi. Tanpa biaya langganan.",
    url: "https://kasirkilat.com",
    siteName: "Kasir KilatQu",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/icon-512.png", // Pastikan gambar ini ada di folder public
        width: 512,
        height: 512,
        alt: "Logo Kasir KilatQu",
      },
    ],
  },
  
  // Agar Google Mengindeks Halaman Ini
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}