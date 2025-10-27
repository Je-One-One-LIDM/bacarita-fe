"use client";

import { type FC, JSX, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavItem = {
  label: string;
  href: string;
  icon?: JSX.Element;
};

const navItems: NavItem[] = [
  { label: "Beranda",           href: "/guru/beranda" },
  { label: "Tambah Murid",      href: "/guru/beranda/tambah-murid" },
  { label: "Performa Murid",    href: "/guru/beranda/performa-murid" },
  { label: "Bacaan Bonus",      href: "/guru/beranda/bacaan-bonus" },
  { label: "Kelola Pre-test",   href: "/guru/beranda/kelola-pre-test" },
];

const Sidebar: FC = () => {
  const pathname = usePathname();

  return (
    <aside className="verdana w-full md:w-[350px] shrink-0 bg-[#EBD7BF]/80 backdrop-blur border-r border-black/10 rounded-r-2xl p-4 md:p-5">
      <h1 className="text-xl md:text-2xl font-extrabold text-[#513723] mb-4 md:mb-6">Dashboard Guru</h1>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-[#513723] transition",
                "hover:bg-[#F6EDE3] hover:shadow-sm",
                active && "bg-[#F6EDE3] shadow ring-1 ring-black/5"
              )}
            >
              <span className="i-lucide-circle-dot text-sm" />
              <span className="font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-black/10">
        <Link
          href="/logout"
          className="block w-full text-left rounded-xl px-3 py-2 text-[#8B5E3C] hover:bg-black/5"
        >
          Keluar
        </Link>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
