"use client";

import { Level } from "@/lib/levels_data";

interface LevelListProps {
  filteredLevels: Level[];
  search: string;
  setSearch: (search: string) => void;
  expandedLevelNo: number | null;
  setExpandedLevelNo: (no: number | null) => void;
}

export default function LevelList({
  filteredLevels,
  search,
  setSearch,
  expandedLevelNo,
  setExpandedLevelNo,
}: LevelListProps) {
  return (
    <div className="rounded-lg border border-[#DE954F] bg-[#FFF8EC] p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-sm font-semibold text-[#4A2C19]">
          Daftar Level dan Bacaan
        </h2>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari level/bacaan"
              className="w-full rounded-xl border border-[#F2C9A8] bg-[#Fff8ec]/80 px-4 py-2 text-xs text-[#4A2C19] outline-none placeholder:text-[#C09A74] focus:border-[#DE954F] focus:ring-1 focus:ring-[#DE954F]"
            />
          </div>
        </div>
      </div>

      <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
        {filteredLevels.map((level) => {
          const isExpanded = expandedLevelNo === level.no;
          const hasStories = level.stories.length > 0;

          return (
            <div
              key={level.no}
              className="overflow-hidden rounded-lg border border-[#F4D4AC] bg-[#Fff8ec]/80 shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedLevelNo(isExpanded ? null : level.no)
                }
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-[#B07A4A]">
                    Level {level.no}{" "}
                    {level.isBonusLevel && (
                      <span className="ml-2 rounded-xl bg-[#FBE8C8] px-2 py-0.5 text-[10px] font-semibold text-[#B67625]">
                        Bonus
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-[#4A2C19]">
                    {level.name}
                  </div>
                  <div className="text-[11px] text-[#8A5B3D]">
                    {hasStories
                      ? `${level.stories.length} bacaan`
                      : "Belum ada bacaan di level ini"}
                  </div>
                </div>
                <span className="rounded-xl border border-[#DE954F] bg-[#FFF3E3] px-3 py-1 text-[11px] font-semibold text-[#B07A4A]">
                  {isExpanded ? "Tutup" : "Lihat Bacaan"}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-[#F4D4AC] bg-[#FFF8EC] px-4 py-3 space-y-3">
                  {!hasStories && (
                    <div className="text-[11px] text-[#8A5B3D]">
                      Belum ada bacaan. Tambahkan bacaan baru di panel
                      kanan.
                    </div>
                  )}

                  {level.stories.map((story, index) => (
                    <div
                      key={`${story.title}-${index}`}
                      className="rounded-lg border border-[#F4D4AC] bg-[#Fff8ec] px-3 py-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[13px] font-semibold text-[#4A2C19]">
                            {story.title}
                          </div>
                          <div className="mt-0.5 text-[11px] text-[#8A5B3D] line-clamp-2">
                            {story.description}
                          </div>
                        </div>
                        <span className="rounded-xl bg-[#FBE8C8] px-2 py-0.5 text-[10px] font-semibold text-[#B67625]">
                          {story.status}
                        </span>
                      </div>
                      <details className="mt-2 text-[11px] text-[#8A5B3D]">
                        <summary className="cursor-pointer text-[11px] font-semibold text-[#DE954F]">
                          Lihat teks bacaan
                        </summary>
                        <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-[#FFF3E3] p-2 font-mono text-[11px] text-[#4A2C19]">
                          {story.passage}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}