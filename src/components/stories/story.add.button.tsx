import React, { useEffect, useState } from "react";
import type { Story } from "@/lib/types";
import { Modal } from "@/components/ui/modal";

const AddStoryButton = ({ onAdd, nextId }: { onAdd: (s: Story) => void; nextId: number }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Story>({ id: nextId, title: "", description: "", image: "https://picsum.photos/seed/new/400/240", goldMedal: false, silverMedal: false, bronzeMedal: false });
  useEffect(() => setDraft((d) => ({ ...d, id: nextId })), [nextId]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-xl font-semibold text-sm bg-emerald-600 text-white">
        Tambah Story
      </button>
      {open && (
        <Modal title="Story Baru" onClose={() => setOpen(false)}>
          <div className="grid gap-3">
            <input className="rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="Judul" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <textarea className="rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="Deskripsi" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <input className="rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="URL Gambar" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-xs rounded-lg font-semibold bg-black/10">
                Batal
              </button>
              <button
                onClick={() => {
                  onAdd(draft);
                  setOpen(false);
                }}
                className="px-3 py-1.5 text-xs rounded-lg font-semibold bg-emerald-600 text-white"
              >
                Tambah
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default AddStoryButton;
