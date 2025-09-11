"use client";
import React, { useMemo, useState } from "react";
import { Header } from "@/components/ui/header";
import { HeroBanner } from "@/components/ui/hero.banner";
import { SectionTitle } from "@/components/ui/section.title";
import { EmptyState } from "@/components/ui/empty.state";
import AddStoryButton from "@/components/stories/story.add.button";
import StoryCard from "@/components/stories/story.card";
import { ImportExport } from "@/components/stories/story.import";
import ChildrenProgressPanel from "@/components/children/children.progress";
import { useBacaritaData } from "@/lib/use.bacarita.data";

const TeacherPage = () => {
  const { stories, setStories, children, setChildren } = useBacaritaData();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => stories.filter((s) => s.title.toLowerCase().includes(query.toLowerCase())), [stories, query]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        <HeroBanner />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7">
            <SectionTitle title="Kelola Cerita" subtitle="Silahkan tambah, ubah, atau hapus cerita" />
            <div className="flex items-center gap-3 mb-4">
              <input
                className="w-full rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2D7C]/30"
                placeholder="Cari story…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <AddStoryButton onAdd={(s) => setStories([...stories, s])} nextId={(stories.at(-1)?.id || 0) + 1} />
              <ImportExport stories={stories} setStories={setStories} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {filtered.map((s) => (
                <StoryCard key={s.id} story={s} onDelete={() => setStories(stories.filter((x) => x.id !== s.id))} onUpdate={(ns) => setStories(stories.map((x) => (x.id === ns.id ? ns : x)))} />
              ))}
              {filtered.length === 0 && <EmptyState text="Tidak ada story ditemukan." />}
            </div>
          </section>

          <section className="lg:col-span-5">
            <SectionTitle title="Progress Per Anak" subtitle="Urutkan berdasarkan rata-rata distraksi tertinggi" />
            <ChildrenProgressPanel stories={stories} childList={children} setChildren={setChildren} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
