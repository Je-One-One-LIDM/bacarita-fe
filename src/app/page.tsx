"use client";
import { useState } from "react";
import { Story, Level } from "../interface/story.interface";
import { levels } from "../data/story.data";
import { useColors } from "@/hooks/use.colors";

const HomePage = () => {
  const [showLockMessage, setShowLockMessage] = useState<number | null>(null);
  const colors = useColors();

  const handleStoryClick = (story: Story, level: Level) => {
    if (!level.isUnlocked) {
      setShowLockMessage(level.id);
      setTimeout(() => setShowLockMessage(null), 3000);
      return;
    }
    window.location.href = `/baca/${story.id}`;
    window.location.href = `/baca/`;
  };

  const totalPoints = (goldCount: number, silverCount: number, bronzeCount: number) => {
    return goldCount * 3 + silverCount * 2 + bronzeCount * 1;
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="relative m-10 h-[300px] rounded-lg overflow-hidden">
        <img src="/assets/beranda/background.png" alt="Background" className="rounded-2xl absolute inset-0 h-full object-cover" />
        <div className="relative z-10 flex items-center justify-between h-full px-6">
          <div className="flex items-center flex-row ">
            <img src="/assets/beranda/maskot.png" alt="Maskot" className="mt-10 w-50 object-contain" />

            <div className="bg-[#FFF8EC] mb-10 p-4 rounded-lg shadow-md max-w-xl">
              <h1 className="text-2xl font-bold text-[#1C3751]">Halo, Anargya Petualang Cilik</h1>
              <p className="text-lg text-[#1C3751] mt-1">Mari berpetualang dan belajar sambil bermain</p>
            </div>
          </div>

          <div className="relative">
            <img src="/assets/beranda/wood.png" alt="Papan Kayu" className="w-48 object-contain" />
            <div className="absolute top-6 left-4 flex gap-1">
              <img src="/assets/medals/gold_medal.svg" alt="Gold" className="w-12 h-12" />
              <img src="/assets/medals/silver_medal.svg" alt="Silver" className="w-12 h-12" />
              <img src="/assets/medals/bronze_medal.svg" alt="Bronze" className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 pt-8">
        {levels.map((level) => (
          <div key={level.id} className="mb-8">
            <div className={`flex items-center justify-between p-4 rounded-lg mb-4 transition-all ${level.isUnlocked ? "" : ""}`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {!level.isUnlocked && <span className="text-2xl">🔒</span>}
                  <h2 className="text-2xl font-bold" style={{ color: colors.primaryText }}>
                    {level.name}
                  </h2>
                </div>
              </div>

              {level.isUnlocked && (
                <div className="flex items-center gap-3 text-right">
                  <div className="flex items-center gap-1">
                    <img src="/assets/medals/gold_medal.svg" alt="Gold" className="w-10 h-10" />
                    <span className="font-bold" style={{ color: colors.primaryText }}>
                      {level.goldCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <img src="/assets/medals/silver_medal.svg" alt="Silver" className="w-10 h-10" />
                    <span className="font-bold" style={{ color: colors.primaryText }}>
                      {level.silverCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <img src="/assets/medals/bronze_medal.svg" alt="Bronze" className="w-10 h-10" />
                    <span className="font-bold" style={{ color: colors.primaryText }}>
                      {level.bronzeCount}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {level.isUnlocked && (
              <div className="mb-4">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500" style={{ width: `${level.progress}%` }}></div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm mt-1" style={{ color: colors.secondaryText }}>
                    Progress: {level.progress}%
                  </div>

                  <div className="">
                    <div className="text-sm" style={{ color: colors.secondaryText }}>
                      Poin: {totalPoints(level.goldCount, level.silverCount, level.bronzeCount)}
                    </div>
                    {level.progress < 100 && <button className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-green-600 transition">▶️ Main</button>}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[url('/assets/beranda/forest_bg.png')] p-6 rounded-2xl bg-cover bg-center flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {level.stories.map((story) => (
                <div key={story.id}>
                  <div
                    className={`min-w-[320px] min-h-[340px] border-2 border-[#E9E2CF] shadow rounded-2xl p-2 cursor-pointer transition relative ${level.isUnlocked ? "bg-[#FFF8E7] hover:shadow-lg" : "bg-[#FFF8E7] cursor-not-allowed"}`}
                    onClick={() => handleStoryClick(story, level)}
                  >
                    <div className="p-2 min-w-[300px] min-h-[320px] rounded-xl border-1 border-[#E9E2CF]">
                      {!level.isUnlocked && (
                        <div className="absolute h-full top-0 left-0 right-0 bg-black/60 rounded-2xl flex items-center justify-center z-10 py-4">
                          <div className="text-center text-white">
                            <div className="text-3xl mb-1">🔒</div>
                            <div className="text-xs font-bold">TERKUNCI</div>
                          </div>
                        </div>
                      )}

                      <img src={story.image} alt={story.title} className={`w-full h-32 object-cover rounded-md mb-3 ${!level.isUnlocked ? "opacity-60" : ""}`} />

                      <h3 className={`font-bold text-lg mb-2 ${!level.isUnlocked ? "opacity-70" : ""}`} style={{ color: colors.primaryText }}>
                        {story.title}
                      </h3>
                      <p className={`text-sm mb-3 ${!level.isUnlocked ? "opacity-70" : ""}`} style={{ color: colors.secondaryText }}>
                        {story.description}
                      </p>

                      <div className="absolute bottom-10 right-6 flex items-center gap-2">
                        {level.isUnlocked && (
                          <>
                            {story.goldMedal && <img src="/assets/medals/gold_medal.svg" alt="Gold" className="w-12 h-12" />}
                            {story.silverMedal && <img src="/assets/medals/silver_medal.svg" alt="Silver" className="w-12 h-12" />}
                            {story.bronzeMedal && <img src="/assets/medals/bronze_medal.svg" alt="Bronze" className="w-12 h-12" />}
                            {!story.goldMedal && !story.silverMedal && !story.bronzeMedal && <span className="text-gray-400 text-sm">Belum dibaca</span>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showLockMessage === level.id && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">🔒 Kamu harus mendapatkan {level.requiredPoints} poin untuk membuka bacaan di level ini!</div>}
          </div>
        ))}
      </div>
    </main>
  );
};

export default HomePage;
