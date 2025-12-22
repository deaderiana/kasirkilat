"use client";

import Link from 'next/link';
import { 
  Store, ShieldCheck, Zap, ArrowRight, CheckCircle2, 
  LayoutDashboard, Users, Warehouse, TrendingUp, Menu, X 
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-emerald-100">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <Store className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Kasir<span className="text-emerald-600">KilatQu</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition">Fitur</a>
              <a href="#benefits" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition">Keunggulan</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition">Harga</a>
              <div className="flex items-center gap-3 ml-4">
                <Link href="/login" className="text-sm font-bold text-gray-900 hover:text-emerald-600 transition">
                  Masuk
                </Link>
                <Link href="/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Coba Gratis
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl absolute w-full">
            <a href="#features" onClick={()=>setIsMenuOpen(false)} className="block text-sm font-bold text-gray-600">Fitur</a>
            <a href="#benefits" onClick={()=>setIsMenuOpen(false)} className="block text-sm font-bold text-gray-600">Keunggulan</a>
            <Link href="/login" className="block text-sm font-bold text-emerald-600">Masuk Aplikasi</Link>
            <Link href="/register" className="block w-full text-center bg-gray-900 text-white py-3 rounded-xl font-bold">Daftar Sekarang</Link>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Versi Terbaru: WMS Warehouse Ready 🚀
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
          Kelola Toko Jadi Mudah, <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Pantau Untung Jadi Nyata.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Aplikasi kasir online terlengkap untuk UMKM. Kirim struk WA, atur stok gudang (WMS), dan amankan profit bisnis Anda hanya dari genggaman.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
            Mulai Gratis Sekarang <ArrowRight size={20}/>
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 font-bold rounded-full text-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
            Login Owner
          </Link>
        </div>

        {/* Hero Image Mockup (SUDAH DIGANTI GAMBAR ASLI) */}
        <div className="mt-16 relative mx-auto w-full max-w-4xl">
          {/* Efek Glow Belakang */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-20"></div>
          
          {/* Frame Gelap */}
          <div className="relative bg-gray-900 rounded-2xl p-2 shadow-2xl border border-gray-800">
             
             {/* Container Gambar (Menggantikan kotak-kotak palsu) */}
             <div className="bg-white rounded-xl overflow-hidden aspect-[16/9] relative">
                <img 
                  src="/hero-image.png" 
                  alt="Tampilan Aplikasi Kasir KilatQu" 
                  className="w-full h-full object-cover"
                />
             </div>

          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-emerald-600 font-bold tracking-wide uppercase text-sm mb-2">Fitur Unggulan</h2>
            <h3 className="text-3xl font-extrabold text-gray-900">Lebih Dari Sekadar Kasir Biasa</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Zap className="text-blue-600 w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">POS & Struk WA</h4>
              <p className="text-gray-500 leading-relaxed">
                Catat penjualan super cepat. Hemat biaya kertas dengan fitur kirim struk langsung ke WhatsApp pelanggan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold">BARU</div>
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Warehouse className="text-emerald-600 w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Warehouse (WMS)</h4>
              <p className="text-gray-500 leading-relaxed">
                Pantau lokasi rak barang, hitung valuasi aset otomatis, dan dapatkan notifikasi jika stok menipis (Low Stock Alert).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Users className="text-purple-600 w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">CRM & Membership</h4>
              <p className="text-gray-500 leading-relaxed">
                Simpan database pelanggan dan berikan Poin Loyalitas otomatis setiap transaksi agar mereka kembali lagi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENEFITS SECTION --- */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h3 className="text-3xl font-extrabold text-gray-900">Kenapa Pengusaha Cerdas Memilih Kasir KilatQu?</h3>
            <div className="space-y-4">
              {[
                "Data tersimpan aman di Cloud (Anti Hilang)",
                "Bisa diakses dari HP, Tablet, atau Laptop",
                "Fitur keamanan PIN & Lock Mode untuk Karyawan",
                "Laporan Keuangan & Laba Rugi Real-time",
                "Dukungan printer Thermal & Invoice A4"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500 w-6 h-6 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-4">
                <Link href="/register" className="inline-flex items-center gap-2 text-emerald-600 font-bold border-b-2 border-emerald-100 hover:border-emerald-600 transition pb-1">
                    Pelajari selengkapnya <ArrowRight size={16}/>
                </Link>
            </div>
          </div>
          <div className="flex-1 bg-gray-50 p-8 rounded-3xl border border-gray-100">
             {/* Mockup Dashboard Admin */}
             <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
                <div className="flex items-center gap-4 border-b pb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg"><TrendingUp className="text-emerald-600"/></div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Profit Bulan Ini</p>
                        <p className="text-2xl font-extrabold text-gray-900">Rp 15.450.000</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden"><div className="h-full bg-emerald-500 w-3/4"></div></div>
                    <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden"><div className="h-full bg-blue-500 w-1/2"></div></div>
                    <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden"><div className="h-full bg-orange-500 w-1/4"></div></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-medium pt-2">
                    <span>Penjualan</span>
                    <span>HPP</span>
                    <span>Net Profit</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Siap Mengembangkan Bisnis?</h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
              Tinggalkan cara lama yang ribet. Bergabunglah dengan ribuan UMKM yang sudah go-digital bersama Kasir KilatQu.
            </p>
            <Link href="/register" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold text-xl px-10 py-5 rounded-full transition transform hover:scale-105 shadow-lg shadow-emerald-500/30">
              Daftar Gratis Sekarang ⚡
            </Link>
            <p className="mt-6 text-sm text-gray-500">Tanpa kartu kredit • Bisa berhenti kapan saja</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Store className="text-emerald-600 w-6 h-6" />
            <span className="text-xl font-bold text-gray-900">KasirKilatQu</span>
          </div>
          <p className="text-gray-500 text-sm mb-8">© {new Date().getFullYear()} Kasir KilatQu. Hak Cipta Dilindungi.</p>
          <div className="flex justify-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/tentang-kami" className="hover:text-emerald-400 transition">Tentang Kami</Link>
            <Link href="/kebijakan-privasi" className="hover:text-emerald-400 transition">Kebijakan Privasi</Link>
            <Link href="/syarat-ketentuan" className="hover:text-emerald-400 transition">Syarat & Ketentuan</Link>
            <Link href="/bantuan" className="hover:text-emerald-400 transition">Bantuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}