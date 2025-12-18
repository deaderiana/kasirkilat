"use client"; // <--- INI YANG KURANG TADI

import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6 font-bold text-sm">
          <ArrowLeft size={16}/> Kembali
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Pusat Bantuan</h1>
        
        <div className="space-y-6">
            <details className="group bg-gray-50 p-4 rounded-xl cursor-pointer">
                <summary className="font-bold text-gray-800 list-none flex justify-between items-center">
                    Bagaimana cara upgrade ke PRO?
                    <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="text-gray-600 mt-2 text-sm">Klik tombol "Upgrade" di menu sidebar admin, lalu Anda akan diarahkan ke WhatsApp Admin untuk konfirmasi pembayaran.</p>
            </details>

            <details className="group bg-gray-50 p-4 rounded-xl cursor-pointer">
                <summary className="font-bold text-gray-800 list-none flex justify-between items-center">
                    Apakah data saya aman jika HP hilang?
                    <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="text-gray-600 mt-2 text-sm">Sangat aman. Data tersimpan di Server Cloud (Internet), bukan di HP. Cukup login di HP baru, data kembali 100%.</p>
            </details>

            <details className="group bg-gray-50 p-4 rounded-xl cursor-pointer">
                <summary className="font-bold text-gray-800 list-none flex justify-between items-center">
                    Printer apa yang didukung?
                    <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="text-gray-600 mt-2 text-sm">Kami mendukung semua jenis Printer Thermal Bluetooth ukuran 58mm untuk struk, dan Printer Inkjet/Laser standar untuk Invoice A4.</p>
            </details>
        </div>

        <div className="mt-8 p-6 bg-emerald-50 rounded-xl text-center">
            <p className="font-bold text-emerald-800 mb-2">Masih butuh bantuan?</p>
            <button onClick={() => window.open('https://wa.me/6282177771224', '_blank')} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-emerald-700">
                <MessageCircle size={20}/> Chat Customer Service
            </button>
        </div>
      </div>
    </div>
  );
}