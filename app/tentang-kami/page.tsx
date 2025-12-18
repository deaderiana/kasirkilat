import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6 font-bold text-sm">
          <ArrowLeft size={16}/> Kembali ke Beranda
        </Link>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Tentang Kasir KilatQu</h1>
        
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            <strong>Kasir KilatQu</strong> lahir dari sebuah misi sederhana: 
            <em>"Mendigitalisasi UMKM Indonesia tanpa ribet, tanpa mahal."</em>
          </p>
          <p>
            Kami mengerti bahwa tantangan terbesar pengusaha UMKM adalah pengelolaan stok (gudang) 
            dan pencatatan keuangan yang seringkali bocor. Cara manual dengan buku tulis sudah tidak lagi relevan 
            di era yang serba cepat ini.
          </p>
          <p>
            Oleh karena itu, kami membangun Kasir KilatQu dengan fitur <strong>WMS (Warehouse Management System)</strong> 
            dan <strong>CRM (Customer Relation)</strong> yang biasanya hanya ada di software mahal perusahaan besar, 
            kini bisa diakses lewat genggaman tangan Anda.
          </p>
          <p>
            Visi kami adalah menjadi mitra teknologi nomor satu bagi jutaan warung, toko kelontong, 
            cafe, dan retail di seluruh Indonesia agar bisa naik kelas.
          </p>
        </div>
      </div>
    </div>
  );
}