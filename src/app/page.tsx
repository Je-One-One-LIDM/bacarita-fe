"use client";
import Link from "next/link";
import { useState } from "react";

const useColors = () => ({
  background: 'var(--color-bg-primary)',
  primaryText: 'var(--color-text-primary)',
  secondaryText: 'var(--color-text-secondary)',
  accent: 'var(--color-accent)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  lightBlue: 'var(--color-light-blue)',
  white: 'var(--color-white)'
});

interface Story {
  id: number;
  title: string;
  description: string;
  image: string;
  goldMedal: boolean;
  silverMedal: boolean;
  bronzeMedal: boolean;
}

interface Level {
  id: number;
  name: string;
  isUnlocked: boolean;
  requiredPoints: number;
  stories: Story[];
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  progress: number;
}

export default function HomePage() {
  const [showLockMessage, setShowLockMessage] = useState<number | null>(null);
  const colors = useColors();

  const levels: Level[] = [
    {
      id: 1,
      name: "Level 1 - Hewan Sahabat",
      isUnlocked: true,
      requiredPoints: 0,
      goldCount: 2,
      silverCount: 1,
      bronzeCount: 2,
      progress: 100,
      stories: [
        {
          id: 1,
          title: "Kelinci Pemberani",
          description: "Kelinci kecil yang takut gelap belajar menjadi berani",
          image: "https://picsum.photos/seed/rabbit/200/120",
          goldMedal: true,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 2,
          title: "Kura-kura Bijak",
          description: "Kura-kura mengajarkan bahwa lambat tapi pasti",
          image: "https://picsum.photos/seed/turtle/200/120",
          goldMedal: true,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 3,
          title: "Kucing Lucu",
          description: "Kucing kecil mencari rumah baru yang hangat",
          image: "https://picsum.photos/seed/cat/200/120",
          goldMedal: false,
          silverMedal: true,
          bronzeMedal: false
        },
        {
          id: 4,
          title: "Anjing Setia",
          description: "Anjing yang selalu membantu teman-temannya",
          image: "https://picsum.photos/seed/dog/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: true
        },
        {
          id: 5,
          title: "Burung Kecil",
          description: "Burung belajar terbang untuk pertama kalinya",
          image: "https://picsum.photos/seed/bird/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: true
        }
      ]
    },
    {
      id: 2,
      name: "Level 2 - Petualangan Seru",
      isUnlocked: true,
      requiredPoints: 10,
      goldCount: 1,
      silverCount: 2,
      bronzeCount: 1,
      progress: 80,
      stories: [
        {
          id: 6,
          title: "Perjalanan ke Hutan",
          description: "Anak-anak menjelajahi hutan yang penuh misteri",
          image: "https://picsum.photos/seed/forest/200/120",
          goldMedal: true,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 7,
          title: "Kapal Bajak Laut",
          description: "Bajak laut baik hati yang suka menolong",
          image: "https://picsum.photos/seed/pirate/200/120",
          goldMedal: false,
          silverMedal: true,
          bronzeMedal: false
        },
        {
          id: 8,
          title: "Kastil Ajaib",
          description: "Kastil yang berubah warna setiap hari",
          image: "https://picsum.photos/seed/castle/200/120",
          goldMedal: false,
          silverMedal: true,
          bronzeMedal: false
        },
        {
          id: 9,
          title: "Pulau Tersembunyi",
          description: "Pulau kecil dengan harta karun yang hilang",
          image: "https://picsum.photos/seed/island/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: true
        },
        {
          id: 10,
          title: "Gua Berkilau",
          description: "Gua yang penuh dengan kristal berwarna-warni",
          image: "https://picsum.photos/seed/cave/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        }
      ]
    },
    {
      id: 3,
      name: "Level 3 - Teman Baru",
      isUnlocked: false,
      requiredPoints: 25,
      goldCount: 0,
      silverCount: 0,
      bronzeCount: 0,
      progress: 0,
      stories: [
        {
          id: 11,
          title: "Anak Pindahan",
          description: "Anak baru di sekolah yang malu-malu",
          image: "https://picsum.photos/seed/school/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 12,
          title: "Robot Kecil",
          description: "Robot yang ingin punya perasaan seperti manusia",
          image: "https://picsum.photos/seed/robot/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 13,
          title: "Alien Ramah",
          description: "Alien lucu yang tersesat di Bumi",
          image: "https://picsum.photos/seed/alien/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 14,
          title: "Boneka Hidup",
          description: "Boneka yang hidup di malam hari",
          image: "https://picsum.photos/seed/doll/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 15,
          title: "Penyihir Baik",
          description: "Penyihir muda yang belajar sihir membantu",
          image: "https://picsum.photos/seed/wizard/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        }
      ]
    },
    {
      id: 4,
      name: "Level 4 - Keluarga Hebat",
      isUnlocked: false,
      requiredPoints: 40,
      goldCount: 0,
      silverCount: 0,
      bronzeCount: 0,
      progress: 0,
      stories: [
        {
          id: 16,
          title: "Kakek Pencerita",
          description: "Kakek yang punya cerita dari seluruh dunia",
          image: "https://picsum.photos/seed/grandpa/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 17,
          title: "Ibu Super",
          description: "Ibu yang bisa memasak makanan ajaib",
          image: "https://picsum.photos/seed/mom/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 18,
          title: "Ayah Jagoan",
          description: "Ayah yang jago memperbaiki semua barang rusak",
          image: "https://picsum.photos/seed/dad/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 19,
          title: "Adik Lucu",
          description: "Adik kecil yang selalu bikin tertawa",
          image: "https://picsum.photos/seed/baby/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 20,
          title: "Nenek Pintar",
          description: "Nenek yang tahu rahasia merawat tanaman",
          image: "https://picsum.photos/seed/grandma/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        }
      ]
    },
    {
      id: 5,
      name: "Level 5 - Dunia Fantasi",
      isUnlocked: false,
      requiredPoints: 60,
      goldCount: 0,
      silverCount: 0,
      bronzeCount: 0,
      progress: 0,
      stories: [
        {
          id: 21,
          title: "Naga Baik Hati",
          description: "Naga yang suka membantu anak-anak",
          image: "https://picsum.photos/seed/dragon/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 22,
          title: "Putri Pemberani",
          description: "Putri yang menyelamatkan kerajaan",
          image: "https://picsum.photos/seed/princess/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 23,
          title: "Kuda Terbang",
          description: "Kuda ajaib yang bisa terbang di awan",
          image: "https://picsum.photos/seed/pegasus/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 24,
          title: "Pohon Bicara",
          description: "Pohon tua yang bisa berbicara dan bercerita",
          image: "https://picsum.photos/seed/tree/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        },
        {
          id: 25,
          title: "Bintang Jatuh",
          description: "Bintang yang jatuh dan menjadi teman baik",
          image: "https://picsum.photos/seed/star/200/120",
          goldMedal: false,
          silverMedal: false,
          bronzeMedal: false
        }
      ]
    }
  ];

  const handleStoryClick = (story: Story, level: Level) => {
    if (!level.isUnlocked) {
      setShowLockMessage(level.id);
      setTimeout(() => setShowLockMessage(null), 3000);
      return;
    }
    window.location.href = `/baca/${story.id}`;
  };

  const totalPoints = (goldCount: number, silverCount: number, bronzeCount: number) => {
    return (goldCount * 3) + (silverCount * 2) + (bronzeCount * 1);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="relative py-16 px-4">
        <img 
          src="/assets/beranda/background.png" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 text-center flex flex-col items-center">
          <img 
            src="/assets/beranda/maskot.png" 
            alt="Maskot Bacarita" 
            className="w-32 h-32 mb-4 object-contain"
          />
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
            Halo, Anargya Petualang Cilik!
          </h1>
          <p className="text-xl text-white drop-shadow-md">
            Mari berpetualang dan belajar sambil bermain
          </p>
        </div>
      </div>

      <div className="px-4 pb-8 pt-8">
        {levels.map((level) => (
          <div key={level.id} className="mb-8">
            <div 
              className={`flex items-center justify-between p-4 rounded-lg mb-4 transition-all ${
                level.isUnlocked ? 'bg-white shadow-md' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {!level.isUnlocked && (
                    <span className="text-2xl">🔒</span>
                  )}
                  <h2 className="text-2xl font-bold" style={{ color: colors.primaryText }}>
                    {level.name}
                  </h2>
                </div>
                
                {level.isUnlocked && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <img src="/assets/medals/gold_medal.svg" alt="Gold" className="w-6 h-6" />
                      <span className="font-bold" style={{ color: colors.primaryText }}>
                        {level.goldCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="/assets/medals/silver_medal.svg" alt="Silver" className="w-6 h-6" />
                      <span className="font-bold" style={{ color: colors.primaryText }}>
                        {level.silverCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="/assets/medals/bronze_medal.svg" alt="Bronze" className="w-6 h-6" />
                      <span className="font-bold" style={{ color: colors.primaryText }}>
                        {level.bronzeCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {level.isUnlocked && (
                <div className="text-right">
                  <div className="text-sm" style={{ color: colors.secondaryText }}>
                    Poin: {totalPoints(level.goldCount, level.silverCount, level.bronzeCount)}
                  </div>
                  {level.progress < 100 && (
                    <button 
                      className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-green-600 transition"
                    >
                      ▶️ Main
                    </button>
                  )}
                </div>
              )}
            </div>

            {level.isUnlocked && (
              <div className="mb-4">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500"
                    style={{ width: `${level.progress}%` }}
                  ></div>
                </div>
                <div className="text-sm mt-1" style={{ color: colors.secondaryText }}>
                  Progress: {level.progress}%
                </div>
              </div>
            )}

            <div className="flex gap-4 overflow-x-auto pb-4">
              {level.stories.map((story) => (
                <div key={story.id}>
                  <div 
                    className={`min-w-[280px] shadow rounded-lg p-4 cursor-pointer transition relative ${
                      level.isUnlocked 
                        ? 'bg-white hover:shadow-lg' 
                        : 'bg-gray-50'
                    }`}
                    onClick={() => handleStoryClick(story, level)}
                  >
                    {!level.isUnlocked && (
                      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-60 rounded-t-lg flex items-center justify-center z-10 py-4">
                        <div className="text-center text-white">
                          <div className="text-3xl mb-1">🔒</div>
                          <div className="text-xs font-bold">TERKUNCI</div>
                        </div>
                      </div>
                    )}

                    <img 
                      src={story.image} 
                      alt={story.title} 
                      className={`w-full h-32 object-cover rounded mb-3 ${
                        !level.isUnlocked ? 'opacity-60' : ''
                      }`}
                    />
                    <h3 
                      className={`font-bold text-lg mb-2 ${
                        !level.isUnlocked ? 'opacity-70' : ''
                      }`} 
                      style={{ color: colors.primaryText }}
                    >
                      {story.title}
                    </h3>
                    <p 
                      className={`text-sm mb-3 ${
                        !level.isUnlocked ? 'opacity-70' : ''
                      }`} 
                      style={{ color: colors.secondaryText }}
                    >
                      {story.description}
                    </p>
                    
                    <div className="flex gap-2">
                      {level.isUnlocked ? (
                        <>
                          {story.goldMedal && (
                            <img src="/assets/medals/gold_medal.svg" alt="Gold" className="w-5 h-5" />
                          )}
                          {story.silverMedal && (
                            <img src="/assets/medals/silver_medal.svg" alt="Silver" className="w-5 h-5" />
                          )}
                          {story.bronzeMedal && (
                            <img src="/assets/medals/bronze_medal.svg" alt="Bronze" className="w-5 h-5" />
                          )}
                          {!story.goldMedal && !story.silverMedal && !story.bronzeMedal && (
                            <span className="text-gray-400 text-sm">Belum dibaca</span>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex gap-2 items-center opacity-40">
                            <img src="/assets/medals/gold_medal.svg" alt="Gold" className="w-5 h-5" />
                            <img src="/assets/medals/silver_medal.svg" alt="Silver" className="w-5 h-5" />
                            <img src="/assets/medals/bronze_medal.svg" alt="Bronze" className="w-5 h-5" />
                          </div>
                          <span className="text-gray-500 text-xs ml-2">🔒 Medal tersedia</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showLockMessage === level.id && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                🔒 Kamu harus mendapatkan {level.requiredPoints} poin untuk membuka bacaan di level ini!
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}