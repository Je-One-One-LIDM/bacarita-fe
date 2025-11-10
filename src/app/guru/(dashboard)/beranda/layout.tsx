import Sidebar from "@/components/guru/sidebar";

export default function BerandaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#F2E3D1]">
      <div className="mx-auto max-w-screen min-h-screen">
        <div className="flex gap-4 md:gap-6 min-h-dvh">
          <Sidebar />
          <main className="verdana flex-1 m-2 p-4 md:p-6 lg:p-8 ">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
