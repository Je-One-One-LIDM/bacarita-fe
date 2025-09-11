import React from "react";

export function MedalGroup({ medals }: { medals: { gold?: number; silver?: number; bronze?: number } }) {
  const g = medals.gold || 0,
    s = medals.silver || 0,
    b = medals.bronze || 0;
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1">
        <img src={"assets/medals/gold_medal.svg"} className="h-10 w-10"/>
        <span className="text-sm font-semibold">{g}</span>
      </span>
      <span className="flex items-center gap-1">
        <img src={"assets/medals/silver_medal.svg"} className="h-10 w-10" />
        <span className="text-sm font-semibold">{s}</span>
      </span>
      <span className="flex items-center gap-1">
        <img src={"assets/medals/bronze_medal.svg"} className="h-10 w-10" />

        <span className="text-sm font-semibold">{b}</span>
      </span>
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      {label && <div className="mb-1 text-xs text-black/60">{label}</div>}
      <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
