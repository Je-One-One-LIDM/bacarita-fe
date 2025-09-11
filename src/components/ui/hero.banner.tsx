import React from "react";

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/5 shadow-sm bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B]/70 to-[#3A506B]/30" />
      <div className="relative p-6 sm:p-10 text-white">
        <div className="text-2xl sm:text-3xl font-extrabold">Halo, Selamat Datang</div>
        <p className="mt-2 max-w-2xl text-white/90">Pantau kemajuan anak, kelola stories, dan lihat statistik distraksi.</p>
        <div className="mt-4 flex gap-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-500/90 font-semibold">Bacarita</span>
        </div>
      </div>
    </div>
  );
}
