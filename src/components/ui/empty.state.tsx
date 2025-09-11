import React from "react";

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="col-span-full text-center rounded-2xl border border-dashed border-black/10 p-8 bg-white/60">
      <div className="text-3xl">🌲</div>
      <p className="mt-2 text-sm text-black/60">{text}</p>
    </div>
  );
}
