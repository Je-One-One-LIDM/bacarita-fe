"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  initialLevelsData,
  Level,
  StoryStatus,
} from "@/lib/levels_data";

// Impor komponen baru
import PendingStoryList, {
  StoryWithContext,
} from "@/components/kurator/pending_story";
import StoryReaderPane from "@/components/kurator/reader_story";

export default function CuratorPage() {
  const [levels, setLevels] = useState<Level[]>(initialLevelsData);
  const [search, setSearch] = useState("");
  const [selectedStory, setSelectedStory] = useState<StoryWithContext | null>(
    null
  );

  const pendingStories = useMemo(() => {
    const allPending: StoryWithContext[] = [];
    levels.forEach((level) => {
      level.stories
        .filter((story) => story.status === StoryStatus.PENDING)
        .forEach((story) => {
          allPending.push({
            ...story,
            levelNo: level.no,
            levelName: level.name,
          });
        });
    });
    return allPending;
  }, [levels]);

  // 2. Filter cerita PENDING berdasarkan pencarian
  const filteredPendingStories = useMemo(
    () =>
      pendingStories.filter((story) => {
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        return (
          story.title.toLowerCase().includes(term) ||
          story.levelName.toLowerCase().includes(term)
        );
      }),
    [pendingStories, search]
  );

  // 3. Hitung total cerita
  const totalStories = useMemo(
    () => levels.reduce((acc, level) => acc + level.stories.length, 0),
    [levels]
  );
  
  // 4. Logic untuk menyetujui cerita
  function handleApproveStory() {
    if (!selectedStory) return;

    const { levelNo, title } = selectedStory;

    setLevels((prevLevels) => {
      // Buat salinan state
      const updatedLevels = prevLevels.map((level) => {
        // Jika bukan level yang relevan, lewati
        if (level.no !== levelNo) {
          return level;
        }
        
        // Jika ini levelnya, map ceritanya
        const updatedStories = level.stories.map((story) => {
          // Jika bukan cerita yang relevan, lewati
          if (story.title !== title) {
            return story;
          }
          
          // Jika ini ceritanya, ubah statusnya
          return { ...story, status: StoryStatus.ACCEPTED };
        });

        // Kembalikan level dengan cerita yang sudah diupdate
        return { ...level, stories: updatedStories };
      });

      return updatedLevels;
    });

    // Kosongkan panel baca dan pencarian
    setSelectedStory(null);
    setSearch("");
  }

  return (
    <div className="h-full w-full">
      <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-6 md:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#4A2C19]">
              Tinjau Bacaan (Kurator)
            </h1>
            <p className="mt-1 text-xs text-[#8A5B3D] max-w-xl">
              Tinjau bacaan yang diajukan, baca teksnya dengan teliti, dan
              setujui (ACC) jika sudah sesuai.
            </p>
          </div>
          <Link
            href="/admin/beranda" // Asumsi kembali ke beranda yang sama
            className="rounded-xl border border-[#DE954F] bg-[#FFF8EC] px-4 py-2 text-xs font-semibold text-[#8A5B3D] hover:bg-[#f8e3c9]"
          >
            Kembali ke Beranda
          </Link>
        </div>

        {/* Panel Statistik */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
          <div className="rounded-lg border border-[#DE954F] bg-[#FFF8EC] px-3 py-2">
            <span className="font-semibold text-[#4A2C19]">
              {levels.length}
            </span>{" "}
            <span className="text-[#8A5B3D]">total level</span>
          </div>
          <div className="rounded-lg border border-[#DE954F] bg-[#FFF8EC] px-3 py-2">
            <span className="font-semibold text-[#4A2C19]">
              {totalStories}
            </span>{" "}
            <span className="text-[#8A5B3D]">total bacaan</span>
          </div>
          <div className="rounded-lg border border-[#DE954F] bg-[#DE954F] px-3 py-2">
            <span className="font-semibold text-white">
              {pendingStories.length}
            </span>{" "}
            <span className="text-white/90">menunggu persetujuan</span>
          </div>
        </div>

        {/* Struktur grid ini sama persis dengan kode AdminLevelPage asli Anda 
          [1.2fr, 0.9fr]
        */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.9fr]">
          
          {/* Panel Kiri: Daftar Cerita PENDING */}
          <PendingStoryList
            pendingStories={filteredPendingStories}
            selectedStory={selectedStory}
            onSelectStory={setSelectedStory}
            search={search}
            setSearch={setSearch}
          />

          {/* Panel Kanan: Panel Baca & Tombol ACC */}
          <StoryReaderPane
            story={selectedStory}
            onApprove={handleApproveStory}
          />
        </section>
      </div>
    </div>
  );
}