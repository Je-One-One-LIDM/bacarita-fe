import StatCard from "@/components/ui/stat.card";

export default function Beranda() {
  return (
    <div className="space-y-6 ">
      <header>
        <h2 className="verdana text-2xl md:text-3xl font-extrabold text-[#513723]">
          Selamat Datang, Bapak/Ibu Guru!
        </h2>
        <p className="verdana text-[#513723] mt-1">
          Yuk pantau progress murid hari ini!
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard value={48} label="Total Murid" />
        <StatCard value={48} label="Bacaan Bonus" />
        <StatCard value={"80%"} label="Rata-rata Progress" />
      </section>

      <section className="space-y-3">
        <h3 className="verdana font-bold text-[#513723]">Performa Murid</h3>
        <div className="h-56 md:h-72 rounded-xl bg-[#Fff8ec] border border-[#DE954F] shadow-inner grid place-items-center text-[#6C5644]">
          <span className="verdana">Grafik performa (placeholder)</span>
        </div>
      </section>
    </div>
  );
}
