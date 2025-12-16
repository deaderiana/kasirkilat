"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus, Mail, Lock, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo'; // Pastikan path Logo sesuai

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // FIX UTAMA: Ambil URL browser saat ini (IP Laptop atau Localhost)
      // Jadi link di email nanti akan mengikuti IP ini.
      const origin = window.location.origin; 
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Arahkan user kembali ke halaman Login setelah klik link email
          emailRedirectTo: `${origin}/login`, 
        },
      });

      if (error) {
        alert("Gagal Daftar: " + error.message);
      } else {
        // Cek apakah user butuh verifikasi email (default Supabase biasanya ya)
        if (data?.user?.identities?.length === 0) {
            alert("Email ini sudah terdaftar. Silakan login.");
        } else {
            alert("✅ Pendaftaran Berhasil!\n\nSilakan cek INBOX/SPAM email Anda untuk verifikasi akun sebelum login.");
            router.push('/login');
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 font-sans font-inter text-gray-800">
      
      {/* Header Logo */}
      <div className="mb-8 scale-110">
        <Logo />
      </div>

      {/* Card Register */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 w-full max-w-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Buat Akun Baru</h1>
          <p className="text-sm text-gray-500">Mulai kelola usaha Anda dengan Kasir Kilat</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Input Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 ml-1">Email</label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-medium text-sm"
                placeholder="contoh@email.com"
              />
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-medium text-sm"
                placeholder="Minimal 6 karakter"
              />
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* Tombol Daftar */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Daftar Sekarang <UserPlus size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1">
              Login di sini <ArrowRight size={14}/>
            </Link>
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 font-medium">© {new Date().getFullYear()} Kasir Kilat Indonesia</p>
    </div>
  );
}