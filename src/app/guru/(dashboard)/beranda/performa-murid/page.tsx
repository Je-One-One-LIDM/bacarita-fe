type StudentPerf = { id: string; nama: string; skor: number; level: string };

const data: StudentPerf[] = [
  { id: "1", nama: "Aini",  skor: 88, level: "Hijau" },
  { id: "2", nama: "Bima",  skor: 74, level: "Kuning" },
  { id: "3", nama: "Chika", skor: 92, level: "Hijau" },
];

export default function PerformaMurid() {
  return (
    <div className="space-y-6">
      <h2 className="verdana text-xl md:text-2xl font-bold text-[#513723]">Performa Murid</h2>

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="verdana w-full text-left">
          <thead className="bg-[#F4E5D4] text-[#513723]">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Skor</th>
              <th className="px-4 py-3">Level</th>
            </tr>
          </thead>
          <tbody className="text-[#6C5644]">
            {data.map((s) => (
              <tr key={s.id} className="border-t border-black/5">
                <td className="px-4 py-2">{s.nama}</td>
                <td className="px-4 py-2">{s.skor}</td>
                <td className="px-4 py-2">{s.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
