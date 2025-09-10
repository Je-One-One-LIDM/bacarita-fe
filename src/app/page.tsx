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
        <img src="/assets/beranda/background.png" alt="Background" className="absolute inset-0 h-full object-cover" />
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
            <div className={`flex items-center justify-between p-4 rounded-lg mb-4 transition-all ${level.isUnlocked ? "" : "bg-gray-100"}`}>
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

            <div className="flex gap-4 overflow-x-auto pb-4">
              {level.stories.map((story) => (
                <div key={story.id}>
                  <div className={`min-w-[280px] min-h-[330px] shadow rounded-lg p-4 cursor-pointer transition relative ${level.isUnlocked ? "bg-[#FFF8E7] hover:shadow-lg" : "bg-gray-50"}`} onClick={() => handleStoryClick(story, level)}>
                    {!level.isUnlocked && (
                      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-60 rounded-t-lg flex items-center justify-center z-10 py-4">
                        <div className="text-center text-white">
                          <div className="text-3xl mb-1">🔒</div>
                          <div className="text-xs font-bold">TERKUNCI</div>
                        </div>
                      </div>
                    )}

                    <img src={story.image} alt={story.title} className={`w-full h-32 object-cover rounded mb-3 ${!level.isUnlocked ? "opacity-60" : ""}`} />
                    <h3 className={`font-bold text-lg mb-2 ${!level.isUnlocked ? "opacity-70" : ""}`} style={{ color: colors.primaryText }}>
                      {story.title}
                    </h3>
                    <p className={`text-sm mb-3 ${!level.isUnlocked ? "opacity-70" : ""}`} style={{ color: colors.secondaryText }}>
                      {story.description}
                    </p>

                    <div className="flex gap-2">
                      {level.isUnlocked ? (
                        <>
                          {story.goldMedal && <img src="/assets/medals/gold_medal.svg" alt="Gold" className="w-8 h-8" />}
                          {story.silverMedal && <img src="/assets/medals/silver_medal.svg" alt="Silver" className="w-8 h-8" />}
                          {story.bronzeMedal && <img src="/assets/medals/bronze_medal.svg" alt="Bronze" className="w-8 h-8" />}
                          {!story.goldMedal && !story.silverMedal && !story.bronzeMedal && <span className="text-gray-400 text-sm">Belum dibaca</span>}
                        </>
                      ) : (
                        <>
                          <div className="flex gap-2 items-center opacity-40">
                            <img src="/assets/medals/gold_medal.svg" alt="Gold" className="w-8 h-8" />
                            <img src="/assets/medals/silver_medal.svg" alt="Silver" className="w-8 h-8" />
                            <img src="/assets/medals/bronze_medal.svg" alt="Bronze" className="w-8 h-8" />
                          </div>
                          <span className="text-gray-500 text-xs ml-2">🔒 Medal tersedia</span>
                        </>
                      )}
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
