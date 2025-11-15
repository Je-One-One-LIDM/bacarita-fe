"use client";

import { Level, StoryStatus } from "@/lib/levels_data";

interface NewStoryFormState {
  levelNo: number | "";
  title: string;
  description: string;
  passage: string;
  image: string;
  status: StoryStatus;
}

interface AddStoryFormProps {
  levels: Level[];
  newStoryForm: NewStoryFormState;
  setNewStoryForm: React.Dispatch<React.SetStateAction<NewStoryFormState>>;
  handleAddStory: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function AddStoryForm({
  levels,
  newStoryForm,
  setNewStoryForm,
  handleAddStory,
}: AddStoryFormProps) {
  return (
    <div className="rounded-lg border border-[#DE954F] bg-[#FFF8EC] p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[#4A2C19]">
        Tambah Bacaan Baru
      </h2>
      <p className="mt-1 text-[11px] text-[#8A5B3D]">
        Isi teks bacaan yang akan dibaca anak. Admin dapat menyesuaikan
        deskripsi, isi, dan status bacaan.
      </p>
      <form
        onSubmit={handleAddStory}
        className="mt-3 space-y-3 text-xs"
      >
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-[#8A5B3D]">
            Level
          </label>
          <select
            value={newStoryForm.levelNo}
            onChange={(e) =>
              setNewStoryForm((prev) => ({
                ...prev,
                levelNo:
                  e.target.value === ""
                    ? ""
                    : Number.parseInt(e.target.value, 10),
              }))
            }
            className="w-full rounded-xl border border-[#F2C9A8] bg-[#Fff8ec]/90 px-4 py-2 text-xs text-[#4A2C19] outline-none focus:border-[#DE954F] focus:ring-1 focus:ring-[#DE954F]"
          >
            <option value="">Pilih level tujuan</option>
            {levels
              .slice()
              .sort((a, b) => a.no - b.no)
              .map((level) => (
                <option key={level.no} value={level.no}>
                  Level {level.no} — {level.name}
                </option>
              ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-[#8A5B3D]">
            Judul Bacaan
          </label>
          <input
            type="text"
            value={newStoryForm.title}
            onChange={(e) =>
              setNewStoryForm((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-[#F2C9A8] bg:white/90 px-4 py-2 text-xs text-[#4A2C19] outline-none placeholder:text-[#C09A74] focus:border-[#DE954F] focus:ring-1 focus:ring-[#DE954F]"
            placeholder="Misal: Cerita Pendek tentang Kucing"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-[#8A5B3D]">
            Deskripsi Singkat
          </label>
          <textarea
            value={newStoryForm.description}
            onChange={(e) =>
              setNewStoryForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="min-h-[60px] w-full rounded-lg border border-[#F2C9A8] bg-[#Fff8ec]/90 px-4 py-2 text-xs text-[#4A2C19] outline-none placeholder:text-[#C09A74] focus:border-[#DE954F] focus:ring-1 focus:ring-[#DE954F]"
            placeholder="Deskripsi fokus latihan bacaan ini"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-[#8A5B3D]">
            Teks Bacaan
          </label>
          <textarea
            value={newStoryForm.passage}
            onChange={(e) =>
              setNewStoryForm((prev) => ({
                ...prev,
                passage: e.target.value,
              }))
            }
            className="min-h-[120px] w-full rounded-lg border border-[#F2C9A8] bg-[#Fff8ec]/90 px-4 py-2 font-mono text-[11px] text-[#4A2C19] outline-none placeholder:text-[#C09A74] focus:border-[#DE954F] focus:ring-1 focus:ring-[#DE954F]"
            placeholder={`Tulis bacaan baris per baris.
Gunakan enter untuk memisahkan baris.`}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-[#8A5B3D]">
            URL Gambar (opsional)
          </label>
          <input
            type="text"
            value={newStoryForm.image}
            onChange={(e) =>
              setNewStoryForm((prev) => ({
                ...prev,
                image: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-[#F2C9A8] bg-[#Fff8ec]/90 px-4 py-2 text-xs text-[#4A2C19] outline-none placeholder:text-[#C09A74] focus:border-[#DE954F] focus:ring-1 focus:ring-[#DE954F]"
            placeholder="/placeholder.webp"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-[#8A5B3D]">
            Status
          </label>
          <select
            value={newStoryForm.status}
            onChange={(e) =>
              setNewStoryForm((prev) => ({
                ...prev,
                status: e.target.value as StoryStatus,
              }))
            }
            className="w-full rounded-xl border border-[#F2C9A8] bg-[#Fff8ec]/90 px-4 py-2 text-xs text-[#4A2C19] outline-none focus:border-[#DE954F] focus:ring-1 focus:ring-[#DE954F]"
          >
            <option value={StoryStatus.ACCEPTED}>ACCEPTED</option>
            <option value={StoryStatus.PENDING}>PENDING</option>
            <option value={StoryStatus.DRAFT}>DRAFT</option>
          </select>
        </div>

        <button
          type="submit"
          className="mt-1 w-full rounded-xl bg-[#DE954F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#c57833] disabled:opacity-60"
          disabled={
            newStoryForm.levelNo === "" ||
            !newStoryForm.title.trim() ||
            !newStoryForm.passage.trim()
          }
        >
          Tambah Bacaan
        </button>
      </form>
    </div>
  );
}