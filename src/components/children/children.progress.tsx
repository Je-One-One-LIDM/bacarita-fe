import React, { useMemo, useState } from "react";
import type { ChildProgress, Story } from "@/lib/types";
import { MedalGroup, ProgressBar } from "@/components/ui/medals";

const ChildrenProgressPanel = ({ stories, childList, setChildren }: { stories: Story[]; childList: ChildProgress[]; setChildren: (x: ChildProgress[]) => void }) => {
  const [sortBy, setSortBy] = useState<"distraction" | "name">("distraction");

  const rows = useMemo(() => {
    const calc = childList.map((c) => {
      const avg = c.stats.length ? c.stats.reduce((a, b) => a + b.distraction, 0) / c.stats.length : 0;
      const medals = c.stats.reduce(
        (acc, s) => {
          if (s.medals.gold) acc.gold++;
          if (s.medals.silver) acc.silver++;
          if (s.medals.bronze) acc.bronze++;
          return acc;
        },
        { gold: 0, silver: 0, bronze: 0 }
      );
      return { id: c.id, name: c.name, avgDistr: avg, medals, stats: c.stats };
    });
    return [...calc].sort((a, b) => (sortBy === "distraction" ? b.avgDistr - a.avgDistr : a.name.localeCompare(b.name)));
  }, [childList, sortBy]);
  const addChild = () => {
    const name = prompt("Nama anak?");
    if (!name) return;
    const id = Math.max(0, ...childList.map((c) => c.id)) + 1;
    setChildren([...childList, { id, name, stats: stories.map((s) => ({ storyId: s.id, distraction: 0, medals: { gold: false, silver: false, bronze: false } })) }]);
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-black/60">Rata-rata distraksi per anak (0-100). Semakin tinggi = semakin terdistraksi.</div>
        <div className="flex items-center gap-2">
          <button onClick={addChild} className="px-3 py-1.5 text-xs rounded-lg font-semibold bg-emerald-600 text-white">
            + Anak
          </button>
          <select className="text-xs rounded-lg border border-black/10 px-2 py-1 bg-white" value={sortBy} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as "distraction" | "name")}>
            <option value="distraction">Sort: Distraksi ↓</option>
            <option value="name">Sort: Nama A→Z</option>
          </select>
        </div>
      </div>

      <div className="mt-4 divide-y divide-black/5">
        {rows.map((r) => (
          <div key={r.id} className="py-3 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#1A2D7C] text-white grid place-content-center font-bold">{r.name[0]}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{r.name}</div>
                <MedalGroup medals={r.medals} />
              </div>
              <div className="mt-2">
                <ProgressBar value={r.avgDistr} label={`AVG Distraksi: ${r.avgDistr.toFixed(1)}%`} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-black/70">
                {r.stats.map((s) => (
                  <div key={s.storyId} className="flex items-center gap-2">
                    <span className="truncate">{stories.find((x) => x.id === s.storyId)?.title || `Story ${s.storyId}`}</span>
                    <span className="ml-auto font-semibold">{s.distraction}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChildrenProgressPanel;
