"use client";

import { type FC, JSX, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { LogOut, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { showToastSuccess } from "../utils/toast.utils";
import { useRouter } from "next/navigation";
import LogoutServices from "@/services/logout.services";

export type NavItem = { label: string; href: string; icon?: JSX.Element };

const navItems: NavItem[] = [
  { label: "Beranda", href: "/orang-tua/beranda" },
  { label: "Performa Anak", href: "/orang-tua/beranda/performa-anak" },
];

type SidebarProps = { open: boolean; onClose: () => void; onToggle: () => void };

const Sidebar: FC<SidebarProps> = ({ open, onClose, onToggle }) => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await LogoutServices.LogoutGuru(dispatch);
    showToastSuccess("Logout Berhasil!");
    router.push("/");
  };

  return (
    <>
      <div onClick={onClose} className={cn("fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-30 md:hidden", open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} />

      <aside
        className={cn(
          "verdana fixed inset-y-0 left-0 z-40",
          "w-[85%] max-w-sm md:w-[300px] shrink-0",
          "bg-[#FFF8EC] backdrop-blur",
          "border-r-2 border-[#DE954F] rounded-none md:rounded-r-3xl",
          "shadow-2xl md:shadow-lg",
          "p-6 md:p-8",
          "transition-transform duration-300 will-change-transform",
          "flex flex-col",
          open ? "translate-x-0" : "-translate-x-full",
          "overflow-hidden"
        )}
      >
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black text-[#5a4631] tracking-tight">Dashboard</h1>
            <p className="text-sm text-[#5a4631] opacity-60 font-medium">Orang Tua</p>
          </div>
          <button
            onClick={onToggle}
            className={cn("flex items-center justify-center h-10 w-10", "shadow-sm rounded-full border-2 border-[#DE954F]", "bg-[#FFF8EC]", "transition-all duration-300 ease-out", "hover:shadow-md active:scale-95", "text-[#5a4631]")}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item, idx) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-4 py-3",
                  "text-[#5a4631] font-semibold transition-all duration-300",
                  "group overflow-hidden",
                  active ? "bg-[#DE954F] text-white shadow-lg" : "hover:bg-[#EDD1B0] text-[#5a4631]"
                )}
              >
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="my-6 md:my-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[#DE954F] opacity-30"></div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "relative flex items-center justify-center gap-2 w-full",
            "rounded-xl px-4 py-4 text-white font-bold",
            "bg-[#DE954F]",
            "border-2 border-transparent",
            "shadow-lg hover:shadow-2xl",
            "transition-all duration-300 ease-out",
            "hover:scale-105 active:scale-95",
            "group overflow-hidden"
          )}
        >
          <LogOut size={20} className="relative transition-transform group-hover:scale-110 duration-300" />
          <span className="relative">Keluar</span>
        </button>
      </aside>
    </>
  );
};

export default memo(Sidebar);
