"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo'; 

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert("Gagal Daftar: " + error.message);
      else { alert("Pendaftaran Berhasil! Silakan Login."); setIsRegister(false); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Gagal Login: " + error.message);
      else { router.push('/'); }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* KIRI: BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 items-center justify-center relative overflow-hidden p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1920')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 text-white max-w-lg">
            <Logo dark={true} />
            <h1 className="text-5xl font-extrabold mt-8 mb-6 leading-tight">Kelola Bisnis Jadi Lebih Cepat & Cerdas.</h1>
            <p className="text-lg text-gray-300 leading-relaxed">Platform kasir modern yang aman, cepat, dan bisa diakses dari mana saja.</p>
        </div>
      </div>

      {/* KANAN: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6"><Logo /></div>
            <h2 className="text-3xl font-bold text-gray-900">{isRegister ? 'Mulai Bisnismu' : 'Selamat Datang'}</h2>
            <p className="mt-2 text-gray-600">{isRegister ? 'Buat akun baru dalam hitungan detik.' : 'Masuk untuk mengakses kasir.'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6 mt-8">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Bisnis</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-gray-400 pointer-events-none" size={20} />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-medium" placeholder="nama@tokomu.com"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-400 pointer-events-none" size={20} />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-medium font-mono" placeholder="••••••••"/>
                </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all transform hover:scale-[1.01] shadow-lg shadow-emerald-500/25">
                {loading ? <Loader2 className="animate-spin" size={22}/> : <>{isRegister ? 'Daftar Sekarang' : 'Masuk Dashboard'} <ArrowRight size={20}/></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}
            <button onClick={() => setIsRegister(!isRegister)} className="text-emerald-600 font-bold ml-2 hover:underline">{isRegister ? 'Login disini' : 'Daftar Gratis'}</button>
          </p>
        </div>
      </div>
    </div>
  );
}