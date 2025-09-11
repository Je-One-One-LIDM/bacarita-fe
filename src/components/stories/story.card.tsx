import React, { useEffect, useState } from "react";
import type { Story } from "@/lib/types";


const StoryCard = ({ story, onDelete, onUpdate }: { story: Story; onDelete: () => void; onUpdate: (s: Story) => void }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Story>(story);
  useEffect(() => setDraft(story), [story]);

  return (
    <div className="rounded-2xl overflow-hidden border border-black/10 bg-white shadow-sm">
      <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${story.image})` }} />
      <div className="p-4">
        {!editing ? (
          <>
            <h3 className="font-bold text-lg">{story.title}</h3>
            <p className="text-sm text-black/70 mt-1 min-h-[2.5rem]">{story.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-2">
                <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-xs rounded-lg font-semibold bg-amber-500/90 text-white">
                  Edit
                </button>
                <button onClick={onDelete} className="px-3 py-1.5 text-xs rounded-lg font-semibold bg-red-500/90 text-white">
                  Hapus
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-2">
              <input className="rounded-lg border border-black/10 px-3 py-2 text-sm" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <textarea className="rounded-lg border border-black/10 px-3 py-2 text-sm" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <input className="rounded-lg border border-black/10 px-3 py-2 text-sm" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs rounded-lg font-semibold bg-black/10">
                Batal
              </button>
              <button
                onClick={() => {
                  onUpdate(draft);
                  setEditing(false);
                }}
                className="px-3 py-1.5 text-xs rounded-lg font-semibold bg-emerald-600 text-white"
              >
                Simpan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StoryCard;