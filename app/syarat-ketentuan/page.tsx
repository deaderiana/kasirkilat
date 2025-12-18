import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6 font-bold text-sm">
          <ArrowLeft size={16}/> Kembali
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Syarat & Ketentuan</h1>
        <ul className="list-disc pl-5 space-y-3 text-gray-600">
            <li><strong>Penggunaan Wajar:</strong> Anda dilarang menggunakan aplikasi ini untuk kegiatan ilegal atau penipuan.</li>
            <li><strong>Pembayaran:</strong> Fitur PRO adalah layanan berbayar. Kami berhak membatasi akses jika masa berlangganan habis.</li>
            <li><strong>Kepemilikan Akun:</strong> Satu akun hanya boleh digunakan oleh satu pemilik usaha (atau staf yang diberi izin).</li>
            <li><strong>Penyalahgunaan:</strong> Kami berhak memblokir akun secara permanen jika terindikasi melakukan spam atau upaya peretasan sistem.</li>
        </ul>
      </div>
    </div>
  );
}