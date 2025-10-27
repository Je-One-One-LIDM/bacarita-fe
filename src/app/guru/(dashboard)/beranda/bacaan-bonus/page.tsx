type Bonus = { id: string; judul: string; kategori: string };

const bonusList: Bonus[] = [
  { id: "b1", judul: "Rasi Bintang", kategori: "Sains" },
  { id: "b2", judul: "Legenda Nusantara", kategori: "Dongeng" },
];

export default function BacaanBonus() {
  return (
    <div className="space-y-6">
      <h2 className="verdana text-xl md:text-2xl font-bold text-[#513723]">Bacaan Bonus</h2>

      <ul className="grid sm:grid-cols-2 gap-4">
        {bonusList.map((b) => (
          <li key={b.id} className="rounded-2xl bg-[#F4E5D4] border border-black/10 p-4">
            <div className="verdana font-bold text-[#513723]">{b.judul}</div>
            <div className="verdana text-sm text-[#6C5644] mt-1">{b.kategori}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
