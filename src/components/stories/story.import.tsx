import React from "react";
import type { Story } from "@/lib/types";

export function ImportExport({ stories, setStories }: { stories: Story[]; setStories: (s: Story[]) => void }) {
  const download = () => {
    const blob = new Blob([JSON.stringify(stories, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stories.bacarita.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const upload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setStories(JSON.parse(String(reader.result)) as Story[]);
      } catch {
        alert("File tidak valid");
      }
    };
    reader.readAsText(file);
  };
  return (
    <div className="flex items-center gap-2">
      <button onClick={download} className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-black/10">
        Export JSON
      </button>
      <label className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-black/10 cursor-pointer">
        Import JSON
        <input type="file" className="hidden" accept="application/json" onChange={(e) => e.target.files && upload(e.target.files[0])} />
      </label>
    </div>
  );
}
