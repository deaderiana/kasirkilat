import React from 'react';
import { Zap } from 'lucide-react';

export default function Logo({ dark = false }: { dark?: boolean }) {
  const textColor = dark ? 'text-white' : 'text-gray-800';
  const accentColor = dark ? 'text-emerald-300' : 'text-emerald-600';

  return (
    <div className="flex items-center gap-2">
      <div className={`p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20`}>
        <Zap size={24} className="text-white fill-white" />
      </div>
      <div className={`font-extrabold text-2xl tracking-tight ${textColor}`}>
        Kasir<span className={accentColor}>Kilat</span>
      </div>
    </div>
  );
}