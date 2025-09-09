"use client";
import { useState } from "react";
import VoiceNoteSim from "@/components/VoiceNoteSim";

export default function PertanyaanPage() {
  const [sent, setSent] = useState(false);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Tes Pemahaman</h1>
      <p className="mb-6 text-lg">Apa yang dilakukan kelinci dalam cerita?</p>
      <VoiceNoteSim sent={sent} setSent={setSent} />
      {sent && (
        <div className="mt-4 text-green-600 font-semibold">
          Voice note dikirim! (simulasi)
        </div>
      )}
    </main>
  );
}