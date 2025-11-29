"use client";

import { Story, StoryStatus } from "@/lib/levels_data";

export interface StoryWithContext extends Story {
  levelNo: number;
  levelName: string;
}

interface PendingStoryListProps {
  pendingStories: StoryWithContext[];
  selectedStory: StoryWithContext | null;
  onSelectStory: (story: StoryWithContext) => void;
  search: string;
  setSearch: (search: string) => void;
}

export default function PendingStoryList({
  pendingStories,
  selectedStory,
  onSelectStory,
  search,
  setSearch,
}: PendingStoryListProps) {
  return (
    <div className="verdana rounded-lg border border-[#DE954F] bg-[#FFF8EC] p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-sm font-semibold text-[#4A2C19]">
          Bacaan Menunggu Persetujuan
        </h2>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul bacaan..."
              className="w-full rounded-xl border border-[#F2C9A8] bg-[#Fff8ec]/80 px-4 py-2 text-xs text-[#4A2C19] outline-none placeholder:text-[#C09A74] focus:border-[#DE954F] focus:ring-1 focus:ring-[#DE954F]"
            />
          </div>
        </div>
      </div>

      <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
        {pendingStories.length === 0 && (
          <div className="text-center text-xs text-[#8A5B3D] py-4">
            Tidak ada bacaan yang menunggu persetujuan.
          </div>
        )}

        {pendingStories.map((story) => {
          const isSelected = selectedStory?.title === story.title && selectedStory.levelNo === story.levelNo;
          
          return (
            <button
              key={`${story.levelNo}-${story.title}`}
              type="button"
              onClick={() => onSelectStory(story)}
              className={`w-full overflow-hidden rounded-lg border border-[#F4D4AC] shadow-sm text-left transition-all ${
                isSelected
                  ? "bg-[#Fff8ec] border-3 border-[#DE954F]"
                  : "bg-[#Fff8ec]/80 hover:bg-[#Fff8ec]"
              }`}
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-[#B07A4A]">
                    Level {story.levelNo} — {story.levelName}
                  </div>
                  <span className="rounded-xl bg-[#FBE8C8] px-2 py-0.5 text-[10px] font-semibold text-[#B67625]">
                    {story.status}
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#4A2C19] mt-0.5">
                  {story.title}
                </div>
                <div className="text-[11px] text-[#8A5B3D] mt-0.5 line-clamp-2">
                  {story.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}