export enum StoryStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

export interface Story {
  title: string;
  description: string;
  passage: string;
  image?: string;
  status: StoryStatus;
}

export interface Level {
  no: number;
  name: string;
  isBonusLevel: boolean;
  stories: Story[];
}

export const initialLevelsData: Level[] = [
  {
    no: 0,
    name: "Pre-Test: Tes Kemampuan Awal",
    isBonusLevel: false,
    stories: [
      {
        title: "Tes Kemampuan Membaca",
        description:
          "Tes awal untuk mengetahui kemampuan membaca saat ini. Hasil tes akan membantu menentukan level yang tepat untuk memulai pembelajaran.",
        passage: `Selamat datang di Bacarita!
Kami ingin tahu kemampuanmu membaca.
Ini bukan ujian, jadi santai saja.
Bacalah cerita ini dengan hati-hati.
Lakukan yang terbaik.
Hasil tes ini akan membantu kami menemukan level yang cocok untukmu.
Setelah selesai, kamu bisa langsung memulai petualangan belajar!
Selamat mengerjakan!`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
    ],
  },
  {
    no: 1,
    name: "Dasar Vokal dan Konsonan",
    isBonusLevel: false,
    stories: [
      {
        title: "Dasar Vokal dan Konsonan",
        description:
          "Fokus A, I, U, M, K. Membangun dasar vokal dan konsonan yang bentuknya sangat berbeda.",
        passage: `M A U
I M A
M I U
K A I
U K I`,
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Bentuk Huruf",
        description:
          "Fokus O, T, R, L. Memperkenalkan bentuk bulat (O) dan garis (T, R, L)",
        passage: `L A R O
T O R U
R O T A
R O L U
T R L A`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Konsonan",
        description:
          "Fokus N, H, S, Z. n yang mirip u harus dipertegas dan dibedakan",
        passage: `N H S
H S Z
S H Z
N S Z
H N Z`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Huruf Reversal",
        description: "Fokus B, D. Pasangan reversal",
        passage: `B A D I
D A B U
B I D A
B U D A
D I B A`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Huruf P Q V Y",
        description: "Fokus P, Q, V, Y",
        passage: `P I Q A
V A P U
Y I P A
P I V U
Q I Y U`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
    ],
  },
  {
    no: 2,
    name: "Suku Kata Terbuka (KV)",
    isBonusLevel: false,
    stories: [
      {
        title: "Suku Kata dengan Konsonan Dasar",
        description: "Fokus pada suku kata dengan konsonan yang sudah dikuasai",
        passage: `Ma Mi Mu
I Ma Mu
A Ma Mu`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Fokus Huruf P",
        description: "Fokus ke huruf P dalam suku kata",
        passage: `Pa Pi Pu
Po Pa Pu
Sa Pu Sa`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
    ],
  },
  {
    no: 3,
    name: "Kata Bermakna (2-3 Suku Kata)",
    isBonusLevel: false,
    stories: [
      {
        title: "Dua Suku Kata Pertama",
        description: "Fokus ke 2 suku kata yang berpola KV-KV",
        passage: `Mama
Kaki
Rusa
Susu
Buku`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Dua Suku Kata Lanjutan",
        description:
          "Fokus kontras perbedaan dengan unit suku kata di huruf b/d",
        passage: `Dadu
Bola
Pipi
Papa
Da da`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Tiga Suku Kata",
        description: "Transisi ke kata dengan 3 suku kata KV-KV-KV",
        passage: `Kelapa
Sepatu
Pisang
Boneka
Terbang`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Kata Tertutup Pertama",
        description: "Pengenalan ke kata tertutup",
        passage: `Kambing
Kantong
Mantap
Samping
Bantal`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Kata Tertutup Lanjutan",
        description: "Pengenalan ke kata tertutup lanjutan",
        passage: `Kambing
Kantong
Mantap
Samping
Bantal`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
    ],
  },
  {
    no: 4,
    name: "Kalimat Sederhana (S-P-O)",
    isBonusLevel: false,
    stories: [
      {
        title: "Kalimat Inti Aktif (S-P)",
        description: "Fokus ke kalimat inti aktif dan S-P",
        passage: `Ayah datang.
Ibu masak.
Kucing tidur.`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Kalimat Transitif (S-P-O)",
        description: "Fokus kalimat transitif dasar dan S-P-O",
        passage: `Budi tendang bola
Kakak minum susu.
Mama masak ayam.`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Kalimat dengan Keterangan (S-P-K)",
        description: "Kalimat dengan keterangan atau S-P-K",
        passage: `Rusa lari di hutan.
Bola ada di meja.
Kakak makan di meja.`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Kalimat Lengkap (S-P-O-K)",
        description: "Kalimat lengkap dengan S-P-O-K",
        passage: `Adik baca buku di kamar
Mama masak ayam di dapur
Ayah baca koran di teras`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Dua Klausa Sederhana",
        description: "2 klausa sederhana",
        passage: `Saya lari dan melompat
Kakak membaca dan mendengar
Ibu senyum dan tertawa`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
    ],
  },
  {
    no: 5,
    name: "Cerita Naratif Sederhana",
    isBonusLevel: false,
    stories: [
      {
        title: "Kalimat S-P/S-P-O Sederhana",
        description: "Semua kalimat S-P/S-P-O sederhana",
        passage: `Saya punya kucing.
Kucing saya warna putih.
Kucing suka minum susu.
Kucing kecil suka tidur.`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Urutan Kronologis",
        description: "Urutan kronologis",
        passage: `Ibu pergi ke pasar.
Ibu naik mobil biru.
Ibu beli banyak sayur.
Ibu pulang bawa tas.`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Pola S-P-O dalam Naratif",
        description: "Memperkuat pola S-P-O Level 4 dalam konteks naratif",
        passage: `Dedi senang sekolah.
Dedi bertemu teman baru.
Mereka baca satu buku.
Mereka main bola di halaman.`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Penggunaan Keterangan",
        description: "Penggunaan keterangan",
        passage: `Di taman ada pohon.
Itu adalah pohon jambu.
Pohon jambu sangat tinggi.
Jambu rasanya manis sekali.`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
      {
        title: "Menggabungkan S-P dan S-P-K",
        description: "Menggabungkan S-P dan S-P-K",
        passage: `Langit mulai gelap.
Angin kencang sekali.
Kemudian hujan turun.
Saya cepat masuk rumah.`,
        image: "/placeholder.webp",
        status: StoryStatus.ACCEPTED,
      },
    ],
  },
];
