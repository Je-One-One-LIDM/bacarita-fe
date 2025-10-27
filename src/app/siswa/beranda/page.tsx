"use client";

import StudentServices from "@/services/student.services";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Level, Story } from "@/types/story.types";
import { showToastError } from "@/components/utils/toast.utils";
import { useEffect } from "react";

const handleStoryClick = (story: Story, level: Level) => {
  if (!level.isUnlocked) {
    console.log("Level terkunci!");
  } else {
    console.log("Membuka cerita:");
  }
};

const SiswaBerandaPage = () => {
  const [levelsData, setLevelsData] = useState<Level[]>([]);
  const dispatch = useDispatch();
  const showLockMessage: number | null = null;

  useEffect(() => {
    const fetchLevels = async () => {
      const response = await StudentServices.GetLevels(dispatch);
      if (response.success) {
        setLevelsData(response.data);
      } else {
        showToastError(response.error);
      }
    };

    fetchLevels();
  }, []);

  return (
    <main className="verdana min-h-screen bg-[#EDD1B0]">
      <div className="p-4 sm:p-6 md:p-10">
        <div className="relative w-full h-[300px] rounded-2xl overflow-hidden shadow-lg">
          <img src="/assets/beranda/background.png" alt="Background" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between h-full p-6">
            <div className="flex items-end">
              <img src="/assets/beranda/maskot.png" alt="Maskot" className="w-40 sm:w-48 object-contain drop-shadow-lg" />
              <div className="bg-[#FFF8EC] p-4 rounded-xl shadow-md max-w-md -ml-8 mb-24">
                <h1 className="text-xl sm:text-2xl font-bold text-[#513723]">Halo, Anargya Petualang Cilik!</h1>
                <p className="text-sm sm:text-base text-[#6C5644] mt-1">Mari berpetualang dan belajar sambil bermain.</p>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img src="/assets/beranda/wood.png" alt="Papan Kayu" className="w-48 object-contain drop-shadow-md" />
              <div className="absolute bottom-12 inset-0 flex items-center justify-center gap-2 px-4">
                <img src="/assets/medals/gold_medal.svg" alt="Gold" className="w-10 h-10 hover:scale-110 transition-transform" />
                <img src="/assets/medals/silver_medal.svg" alt="Silver" className="w-10 h-10 hover:scale-110 transition-transform" />
                <img src="/assets/medals/bronze_medal.svg" alt="Bronze" className="w-10 h-10 hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-12">
          {levelsData.map((level) => (
            <div key={level.id} className="transition duration-300" >
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl">
                <div className="flex items-center gap-4">
                  {!level.isUnlocked && <span className="text-2xl">🔒</span>}
                  <h2 className="text-2xl font-bold text-[#513723]">{level.fullName}</h2>
                </div>
                {level.isUnlocked && (
                  <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1.5">
                      <img src="/assets/medals/gold_medal.svg" alt="Gold" className="w-8 h-8" />
                      <span className="font-bold text-lg text-amber-600">{level.goldCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <img src="/assets/medals/silver_medal.svg" alt="Silver" className="w-8 h-8" />
                      <span className="font-bold text-lg text-slate-500">{level.silverCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <img src="/assets/medals/bronze_medal.svg" alt="Bronze" className="w-8 h-8" />
                      <span className="font-bold text-lg text-orange-700">{level.bronzeCount}</span>
                    </div>
                  </div>
                )}
              </div>

              {level.isUnlocked && (
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1 text-sm text-[#6C5644]">
                    <span>Progress Level</span>
                    <span className="font-semibold">{level.progress}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${level.progress}%` }}></div>
                  </div>
                </div>
              )}
              <div className="bg-[url('/assets/beranda/forest_bg.png')] p-6 rounded-2xl bg-cover bg-center flex gap-6 overflow-x-auto pb-6 no-scrollbar">
                {level.stories.map((story) => (
                  <div key={story.id} className="flex-shrink-0">
                    <div
                      className={`w-72 h-96 bg-[#FFF8E7] border-2 border-[#E9E2CF] shadow-md rounded-2xl p-3 transition-all duration-300 relative group ${
                        level.isUnlocked ? "cursor-pointer hover:shadow-xl hover:-translate-y-1" : "cursor-not-allowed"
                      }`}
                      onClick={() => handleStoryClick(story, level)}
                    >
                      {!level.isUnlocked && (
                        <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center z-10">
                          <div className="text-center text-white">
                            <div className="text-4xl mb-2">🔒</div>
                            <div className="font-bold tracking-wider">TERKUNCI</div>
                          </div>
                        </div>
                      )}

                      <img src={story.imageUrl || "/assets/placeholder.png"} alt={story.titel} className="w-full h-40 object-cover rounded-xl mb-3" />

                      <div className="flex flex-col h-44 justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-[#513723] truncate">{story.titel}</h3>
                          <p className="text-sm text-[#6C5644] mt-1 line-clamp-3">{story.description}</p>
                        </div>
                        <div className="flex items-center justify-end gap-2 h-10">
                          {level.isUnlocked && (
                            <>
                              {story.isGoldMedal && <img src="/assets/medals/gold_medal.svg" alt="Gold" className="w-10 h-10" />}
                              {story.isSilverMedal && <img src="/assets/medals/silver_medal.svg" alt="Silver" className="w-10 h-10" />}
                              {story.isBronzeMedal && <img src="/assets/medals/bronze_medal.svg" alt="Bronze" className="w-10 h-10" />}
                              {!story.isGoldMedal && !story.isSilverMedal && !story.isBronzeMedal && <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Belum Dibaca</span>}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {showLockMessage === level.id && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 rounded-r-lg" role="alert">
                  <p className="font-bold">Terkunci!</p>
                  <p>Kamu harus mendapatkan {level.requiredPoints} poin untuk membuka level ini.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default SiswaBerandaPage;
