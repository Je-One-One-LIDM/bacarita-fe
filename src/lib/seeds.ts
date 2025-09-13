import type { Story, ChildProgress } from "@/lib/types";

export const STORY_SEED: Story[] = [
  {
    id: 1,
    title: "Kelinci Pemberani",
    description: "Kelinci kecil yang takut gelap belajar menjadi berani",
    image: "https://bacarita-fe.vercel.app/assets/beranda/cerita.png",
    goldMedal: true,
    silverMedal: false,
    bronzeMedal: false,
  },
  {
    id: 2,
    title: "Kura-kura Bijak",
    description: "Kura-kura mengajarkan bahwa lambat tapi pasti",
    image: "https://bacarita-fe.vercel.app/assets/beranda/cerita.png",
    goldMedal: true,
    silverMedal: false,
    bronzeMedal: false,
  },
  {
    id: 3,
    title: "Kucing Lucu",
    description: "Kucing kecil mencari rumah baru yang hangat",
    image: "https://bacarita-fe.vercel.app/assets/beranda/cerita.png",
    goldMedal: false,
    silverMedal: true,
    bronzeMedal: false,
  },
  {
    id: 4,
    title: "Anjing Setia",
    description: "Anjing yang selalu membantu teman-temannya",
    image: "https://bacarita-fe.vercel.app/assets/beranda/cerita.png",
    goldMedal: false,
    silverMedal: false,
    bronzeMedal: true,
  },
  {
    id: 5,
    title: "Burung Kecil",
    description: "Burung belajar terbang untuk pertama kalinya",
    image: "https://bacarita-fe.vercel.app/assets/beranda/cerita.png",
    goldMedal: false,
    silverMedal: false,
    bronzeMedal: true,
  },
];

export const CHILDREN_SEED: ChildProgress[] = [
  {
    id: 101,
    name: "Alya",
    stats: [
      { storyId: 1, distraction: 18, medals: { gold: true, silver: false, bronze: false } },
      { storyId: 2, distraction: 27, medals: { gold: false, silver: true, bronze: false } },
      { storyId: 3, distraction: 40, medals: { gold: false, silver: false, bronze: true } },
    ],
  },
  {
    id: 102,
    name: "Bima",
    stats: [
      { storyId: 1, distraction: 32, medals: { gold: false, silver: true, bronze: false } },
      { storyId: 2, distraction: 55, medals: { gold: false, silver: false, bronze: true } },
      { storyId: 3, distraction: 61, medals: { gold: false, silver: false, bronze: true } },
    ],
  },
  {
    id: 103,
    name: "Citra",
    stats: [
      { storyId: 1, distraction: 12, medals: { gold: true, silver: false, bronze: false } },
      { storyId: 2, distraction: 20, medals: { gold: true, silver: false, bronze: false } },
      { storyId: 3, distraction: 24, medals: { gold: false, silver: true, bronze: false } },
    ],
  },
];
