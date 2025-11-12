import { LogOut, User2 } from "lucide-react";
import { BaseProfilePayload } from "@/types/auth.types";

type ProfileProps = {
  profile: BaseProfilePayload | null | undefined;
  handleLogout: () => void;
};

export function StudentProfilePanel({ profile, handleLogout}: ProfileProps) {
  return (
    <div className="rounded-2xl bg-[#FFF8EC] text-[#513723] shadow-lg p-5 w-72">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-semibold">Profile</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User2 className="w-4 h-4" />
          <p className="text-sm">{profile?.fullName ?? "-"}</p>
        </div>
        <div className="my-2 h-px bg-[#513723]/20" />
        <button
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#513723]/30 px-4 py-2 text-sm font-medium active:scale-[0.99] transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
