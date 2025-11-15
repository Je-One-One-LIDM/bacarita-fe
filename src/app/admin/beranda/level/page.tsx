"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  initialLevelsData,
  Level,
  StoryStatus,
  Story,
} from "@/lib/levels_data";

import LevelList from "@/components/admin/level_list";
import AddLevelForm from "@/components/admin/level_form";
import AddStoryForm from "@/components/admin/story_form";

interface NewLevelFormState {
  name: string;
  isBonusLevel: boolean;
}

interface NewStoryFormState {
  levelNo: number | "";
  title: string;
  description: string;
  passage: string;
  image: string;
  status: StoryStatus;
}

export default function AdminLevelPage() {
  const [view, setView] = useState<"list" | "forms">("list");
  const [levels, setLevels] = useState<Level[]>(initialLevelsData);
  const [expandedLevelNo, setExpandedLevelNo] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  const [newLevelForm, setNewLevelForm] = useState<NewLevelFormState>({
    name: "",
    isBonusLevel: false,
  });

  const [newStoryForm, setNewStoryForm] = useState<NewStoryFormState>({
    levelNo: "",
    title: "",
    description: "",
    passage: "",
    image: "",
    status: StoryStatus.ACCEPTED,
  });

  const totalStories = useMemo(
    () => levels.reduce((acc, level) => acc + level.stories.length, 0),
    [levels]
  );

  const filteredLevels = useMemo(
    () =>
      levels
        .slice()
        .sort((a, b) => a.no - b.no)
        .map((level) => ({
          ...level,
          stories: level.stories.filter((story) => {
            if (!search.trim()) return true;
            const term = search.toLowerCase();
            return (
              story.title.toLowerCase().includes(term) ||
              level.name.toLowerCase().includes(term)
            );
          }),
        })),
    [levels, search]
  );

  function handleAddLevel(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newLevelForm.name.trim()) return;

    const nextNo =
      levels.length === 0 ? 0 : Math.max(...levels.map((l) => l.no)) + 1;

    const newLevel: Level = {
      no: nextNo,
      name: newLevelForm.name.trim(),
      isBonusLevel: newLevelForm.isBonusLevel,
      stories: [],
    };

    setLevels((prev) => [...prev, newLevel]);
    setNewLevelForm({ name: "", isBonusLevel: false });
    setExpandedLevelNo(nextNo);
    setView("list"); 
  }

  function handleAddStory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      newStoryForm.levelNo === "" ||
      !newStoryForm.title.trim() ||
      !newStoryForm.passage.trim()
    ) {
      return;
    }

    const levelIndex = levels.findIndex(
      (l) => l.no === newStoryForm.levelNo
    );
    if (levelIndex === -1) return;

    const newStory: Story = {
      title: newStoryForm.title.trim(),
      description: newStoryForm.description.trim(),
      passage: newStoryForm.passage.trim(),
      image: newStoryForm.image.trim() || "/placeholder.webp",
      status: newStoryForm.status,
    };

    const updatedLevels = [...levels];
    updatedLevels[levelIndex] = {
      ...updatedLevels[levelIndex],
      stories: [...updatedLevels[levelIndex].stories, newStory],
    };

    setLevels(updatedLevels);
    setExpandedLevelNo(newStoryForm.levelNo);
    setNewStoryForm({
      levelNo: "",
      title: "",
      description: "",
      passage: "",
      image: "",
      status: StoryStatus.ACCEPTED,
    });
    
    // Setelah berhasil, kembali ke tampilan daftar
    setView("list"); 
  }

  return (
    <div className="h-full w-full">
      <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-6 md:px-6">
        
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#4A2C19]">
              {view === "list" ? "Level & Bacaan" : "Tambah Data Baru"}
            </h1>
            <p className="mt-1 text-xs text-[#8A5B3D] max-w-xl">
              {view === "list"
                ? "Fokus admin di halaman ini adalah menambahkan bacaan baru dan mengatur level latihan membaca."
                : "Isi formulir di bawah ini untuk menambah level atau bacaan baru."}
            </p>
          </div>
          <Link
            href="/admin/beranda"
            className="rounded-xl border border-[#DE954F] bg-[#FFF8EC] px-4 py-2 text-xs font-semibold text-[#8A5B3D] hover:bg-[#f8e3c9]"
          >
            Kembali ke Beranda
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-[#DE954F] bg-[#FFF8EC] px-3 py-2">
              <span className="font-semibold text-[#4A2C19]">
                {levels.length}
              </span>{" "}
              <span className="text-[#8A5B3D]">level</span>
            </div>
            <div className="rounded-lg border border-[#DE954F] bg-[#FFF8EC] px-3 py-2">
              <span className="font-semibold text-[#4A2C19]">
                {totalStories}
              </span>{" "}
              <span className="text-[#8A5B3D]">bacaan</span>
            </div>
          </div>

          {view === "list" ? (
            <button
              type="button"
              onClick={() => setView("forms")}
              className="rounded-xl bg-[#DE954F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#c57833]"
            >
              Tambah Level / Bacaan
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setView("list")}
              className="rounded-xl border border-[#DE954F] bg-[#FFF8EC] px-4 py-2 text-xs font-semibold text-[#8A5B3D] hover:bg-[#f8e3c9]"
            >
              Batal & Kembali ke Daftar
            </button>
          )}
        </div>

        <section>
          {view === "list" && (
            <LevelList
              filteredLevels={filteredLevels}
              search={search}
              setSearch={setSearch}
              expandedLevelNo={expandedLevelNo}
              setExpandedLevelNo={setExpandedLevelNo}
            />
          )}

          {view === "forms" && (
            <div className="grid grid-cols-1 gap-6">
              <AddLevelForm
                newLevelForm={newLevelForm}
                setNewLevelForm={setNewLevelForm}
                handleAddLevel={handleAddLevel}
              />
              <AddStoryForm
                levels={levels}
                newStoryForm={newStoryForm}
                setNewStoryForm={setNewStoryForm}
                handleAddStory={handleAddStory}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}