"use client";
import { useState } from "react";
import WebcamSim from "@/components/WebcamSim";
import TextHighlight from "@/components/TextHighlight";
import Link from "next/link";

const kalimat = [
  "Kelinci berlari sangat cepat.",
  "Kura-kura berjalan perlahan.",
  "Mereka berlomba di hutan.",
];

export default function BacaPage() {
  const [highlightIdx, setHighlightIdx] = useState(0);
  return (
    <main className="min-h-screen bg-white flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">Baca Cerita</h1>
      <WebcamSim />
      <div className="mt-6 w-full max-w-xl text-lg">
        {kalimat.map((text, idx) => (
          <TextHighlight
            key={idx}
            text={text}
            highlighted={highlightIdx === idx}
            onClick={() => setHighlightIdx(idx)}
          />
        ))}
      </div>
      <button
        className="mt-8 py-2 px-6 bg-blue-600 text-white rounded"
        onClick={() => setHighlightIdx((prev) => (prev + 1) % kalimat.length)}
      >
        Next Highlight
      </button>
      <Link href="/pertanyaan">
        <button className="mt-4 py-2 px-6 bg-green-500 text-white rounded">
          Lanjut ke Pertanyaan
        </button>
      </Link>
    </main>
  );
}