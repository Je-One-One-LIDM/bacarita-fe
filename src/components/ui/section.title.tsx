import React from "react";

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-black/60 mt-1">{subtitle}</p>}
    </div>
  );
}
