"use client";

import Link from "next/link";
import { initialLevelsData } from "@/lib/levels_data";

export default function AdminBerandaPage() {
  const totalLevels = initialLevelsData.length;
  const totalStories = initialLevelsData.reduce(
    (acc, level) => acc + level.stories.length,
    0
  );

  return (
    <div className="h-full w-full">
      <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-6 md:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#4A2C19]">
              Beranda Admin
            </h1>
            <p className="mt-1 text-xs text-[#8A5B3D] max-w-xl">
              Pantau ringkasan level dan bacaan yang tersedia sebelum
              menambahkan materi baru.
            </p>
          </div>
          <Link
            href="/admin/beranda/level"
            className="rounded-full bg-[#DE954F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#c57833]"
          >
            Kelola Level & Bacaan
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[#DE954F] bg-[#FFF8EC] p-5 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-wide text-[#B07A4A]">
              Statistik Level
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold text-[#4A2C19]">
                  {totalLevels}
                </div>
                <div className="mt-1 text-xs text-[#8A5B3D]">
                  Level bacaan aktif
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#DE954F] bg-[#FFF8EC] p-5 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-wide text-[#B07A4A]">
              Statistik Bacaan
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold text-[#4A2C19]">
                  {totalStories}
                </div>
                <div className="mt-1 text-xs text-[#8A5B3D]">
                  Total bacaan pada semua level
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-[#DE954F] bg-[#FFF8EC] p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#4A2C19]">
                Ringkasan Kurikulum Bacarita
              </h2>
              <p className="mt-1 text-xs text-[#8A5B3D] max-w-2xl">
                Level disusun bertahap dari pre-test, dasar huruf, suku kata,
                kata bermakna, hingga kalimat dan cerita naratif sederhana.
              </p>
            </div>
          </div>

          <div className="mt-2 grid gap-2 text-xs md:grid-cols-2">
            {initialLevelsData
              .slice()
              .sort((a, b) => a.no - b.no)
              .map((level) => (
                <div
                  key={level.no}
                  className="flex items-center justify-between rounded-2xl border border-[#F4D4AC] bg-[#Fff8ec]/70 px-4 py-3"
                >
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-[#B07A4A]">
                      Level {level.no}
                    </div>
                    <div className="text-sm font-semibold text-[#4A2C19]">
                      {level.name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#8A5B3D]">
                      {level.stories.length} bacaan
                    </div>
                  </div>
                  <Link
                    href="/admin/beranda/level"
                    className="rounded-full bg-[#DE954F] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#c57833]"
                  >
                    Kelola
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
