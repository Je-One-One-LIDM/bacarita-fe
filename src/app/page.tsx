// Home - Pilih Cerita
import Link from "next/link";

export default function HomePage() {
  const stories = [
    { title: "Kelinci dan Kura-kura", cover: "https://picsum.photos/seed/1/200/120" },
    { title: "Petualangan Si Kancil", cover: "https://picsum.photos/seed/2/200/120" },
    { title: "Harimau dan Tikus", cover: "https://picsum.photos/seed/3/200/120" },
  ];
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
      <h1 className="text-3xl font-bold mb-8">Bacarita - Pilih Cerita</h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {stories.map((story, idx) => (
          <Link href="/baca" key={idx}>
            <div className="bg-white shadow rounded-lg p-6 cursor-pointer hover:bg-blue-100 transition">
              <img src={story.cover} alt={story.title} className="rounded mb-2" />
              <h2 className="text-xl font-semibold">{story.title}</h2>
              <p className="text-sm text-gray-500">Cerita level {idx + 1}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}