"use client";
import React, { useMemo, useState } from "react";
import { Header } from "@/components/ui/header";
import { HeroBanner } from "@/components/ui/hero.banner";
import { SectionTitle } from "@/components/ui/section.title";
import { MedalGroup, ProgressBar } from "@/components/ui/medals";
import { useBacaritaData } from "@/lib/use.bacarita.data";
import { classNames } from "@/lib/utils";

export default function ParentPage() {
  const { stories, children } = useBacaritaData();
  const [activeChildId, setActiveChildId] = useState<number>(children[0]?.id ?? 0);
  const child = children.find((c) => c.id === activeChildId) ?? children[0];

  const summary = useMemo(() => {
    if (!child) return { avg: 0, medals: { gold: 0, silver: 0, bronze: 0 } };
    const avg = child.stats.length ? child.stats.reduce((a, b) => a + b.distraction, 0) / child.stats.length : 0;
    const medals = child.stats.reduce(
      (acc, s) => {
        if (s.medals.gold) acc.gold++;
        if (s.medals.silver) acc.silver++;
        if (s.medals.bronze) acc.bronze++;
        return acc;
      },
      { gold: 0, silver: 0, bronze: 0 }
    );
    return { avg, medals };
  }, [child]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        <HeroBanner />

        {!child ? (
          <div className="mt-8">Belum ada data anak.</div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-5">
              <SectionTitle title="Pilih Anak" />
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex flex-wrap gap-2">
                  {children.map((c) => (
                    <button key={c.id} onClick={() => setActiveChildId(c.id)} className={classNames("px-3 py-2 rounded-xl text-sm border", activeChildId === c.id ? "bg-[#1A2D7C] text-white border-[#1A2D7C]" : "bg-white border-black/10")}>
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1A2D7C] text-white grid place-content-center font-bold text-lg">{child.name[0]}</div>
                  <div>
                    <div className="font-extrabold text-lg">{child.name}</div>
                    <div className="text-xs text-black/60">Ringkasan kemajuan & distraksi</div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-black/10 p-3 bg-white/70">
                    <ProgressBar value={summary.avg} label={`Rata-rata Distraksi: ${summary.avg.toFixed(1)}%`} />
                  </div>
                  <div className="rounded-xl border border-black/10 p-3 bg-white/70 flex items-center justify-between">
                    <div className="text-sm text-black/70">Total Medali</div>
                    <MedalGroup medals={summary.medals} />
                  </div>
                </div>
              </div>
            </section>

            <section className="lg:col-span-7">
              <SectionTitle title="Aktivitas Cerita" subtitle="Lihat medali & distraksi per cerita" />
              <div className="grid sm:grid-cols-2 gap-5">
                {child.stats.map((s) => {
                  const story = stories.find((x) => x.id === s.storyId);
                  if (!story) return null;
                  return (
                    <div key={s.storyId} className="rounded-2xl overflow-hidden border border-black/10 bg-white shadow-sm">
                      <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${story.image})` }} />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-lg">{story.title}</h3>
                            <p className="text-sm text-black/70 mt-1 min-h-[2.5rem]">{story.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {s.medals.gold && <img src={"assets/medals/gold_medal.svg"} className="h-10 w-10" />}
                            {s.medals.silver && <img src={"assets/medals/silver_medal.svg"} className="h-10 w-10" />}
                            {s.medals.bronze && <img src={"assets/medals/bronze_medal.svg"} className="h-10 w-10" />}
                          </div>
                        </div>
                        <div className="mt-3">
                          <ProgressBar value={s.distraction} label={`Distraksi: ${s.distraction}%`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
