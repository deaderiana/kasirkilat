import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6 font-bold text-sm">
          <ArrowLeft size={16}/> Kembali
        </Link>

        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full"><Shield size={24}/></div>
            <h1 className="text-3xl font-extrabold text-gray-900">Kebijakan Privasi</h1>
        </div>

        <div className="space-y-6 text-gray-600 text-sm">
          <section>
            <h3 className="font-bold text-gray-900 text-lg mb-2">1. Data yang Kami Kumpulkan</h3>
            <p>Kami mengumpulkan data yang Anda berikan saat mendaftar, seperti nama, email, dan nomor telepon. Kami juga menyimpan data transaksi, produk, dan pelanggan yang Anda input ke dalam sistem untuk keperluan operasional toko Anda.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 text-lg mb-2">2. Penggunaan Data</h3>
            <p>Data Anda hanya digunakan untuk menyediakan layanan Kasir KilatQu. Kami <strong>TIDAK AKAN</strong> menjual data transaksi atau data pelanggan Anda kepada pihak ketiga manapun.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 text-lg mb-2">3. Keamanan Data</h3>
            <p>Kami menggunakan enkripsi standar industri dan server yang aman (Supabase) untuk melindungi data Anda. Namun, Anda bertanggung jawab untuk menjaga kerahasiaan PIN dan Password akun Anda.</p>
          </section>
        </div>
      </div>
    </div>
  );
}