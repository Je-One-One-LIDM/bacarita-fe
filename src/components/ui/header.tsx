import React from "react";

export function Header() {
  return (
    <div className="w-full bg-gradient-to-b from-[#D8F3DC] to-[#FFF7EC] border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/90 text-white grid place-content-center font-black">B</div>
          <div>
            <div className="text-sm uppercase tracking-widest text-black/60">Bacarita</div>
          </div>
        </div>
      </div>
    </div>
  );
}
