type Pretest = { id: string; judul: string; jumlahSoal: number; aktif: boolean };

const pretests: Pretest[] = [
  { id: "p1", judul: "Huruf Dasar", jumlahSoal: 10, aktif: true },
  { id: "p2", judul: "Suku Kata", jumlahSoal: 12, aktif: false },
];

export default function KelolaPretest() {
  return (
    <div className="space-y-6">
      <h2 className="verdana text-xl md:text-2xl font-bold text-[#513723]">Kelola Pre-test</h2>

      <div className="grid gap-3">
        {pretests.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4">
            <div>
              <div className="verdana font-semibold text-[#513723]">{p.judul}</div>
              <div className="verdana text-sm text-[#6C5644]">Soal: {p.jumlahSoal}</div>
            </div>
            <span
              className={`verdana rounded-full px-3 py-1 text-sm ${
                p.aktif ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {p.aktif ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
