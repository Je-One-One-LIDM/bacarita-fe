"use client";

import { StoryWithContext } from "./pending_story"

interface StoryReaderPaneProps {
  story: StoryWithContext | null;
  onApprove: () => void;
}

export default function StoryReaderPane({
  story,
  onApprove,
}: StoryReaderPaneProps) {
  return (
    <div className="rounded-lg border border-[#DE954F] bg-[#FFF8EC] p-4 shadow-sm">
      {!story && (
        <div className="flex h-full min-h-[400px] items-center justify-center">
          <p className="text-sm text-[#8A5B3D]">
            Pilih bacaan di sebelah kiri untuk ditinjau.
          </p>
        </div>
      )}

      {story && (
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-3">
            <div className="space-y-0.5">
              <div className="text-[11px] font-medium uppercase tracking-wide text-[#B07A4A]">
                Level {story.levelNo} — {story.levelName}
              </div>
              <h2 className="text-lg font-semibold text-[#4A2C19]">
                {story.title}
              </h2>
              <p className="text-xs text-[#8A5B3D]">{story.description}</p>
            </div>

            {story.image && story.image !== "/placeholder.webp" && (
              <img
                src={story.image}
                alt={story.title}
                className="w-full h-40 object-cover rounded-lg border border-[#F4D4AC]"
              />
            )}

            <div>
              <label className="text-[11px] font-medium text-[#8A5B3D]">
                Teks Bacaan Lengkap
              </label>
              <pre className="mt-1 max-h-[300px] w-full overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#F2C9A8] bg-[#Fff8ec]/90 p-3 font-mono text-sm text-[#4A2C19]">
                {story.passage}
              </pre>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#F2C9A8]">
            <button
              type="button"
              onClick={onApprove}
              className="w-full rounded-xl bg-[#DE954F] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#c57833]"
            >
              Setujui Bacaan (ACC)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}