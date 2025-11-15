"use client";

interface NewLevelFormState {
  name: string;
  isBonusLevel: boolean;
}

interface AddLevelFormProps {
  newLevelForm: NewLevelFormState;
  setNewLevelForm: React.Dispatch<React.SetStateAction<NewLevelFormState>>;
  handleAddLevel: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function AddLevelForm({
  newLevelForm,
  setNewLevelForm,
  handleAddLevel,
}: AddLevelFormProps) {
  return (
    <div className="rounded-lg border border-[#DE954F] bg-[#FFF8EC] p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[#4A2C19]">
        Tambah Level Baru
      </h2>
      <p className="mt-1 text-[11px] text-[#8A5B3D]">
        Gunakan level untuk mengelompokkan bacaan berdasarkan tingkat
        kesulitan.
      </p>
      <form
        onSubmit={handleAddLevel}
        className="mt-3 space-y-3 text-xs"
      >
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-[#8A5B3D]">
            Nama Level
          </label>
          <input
            type="text"
            value={newLevelForm.name}
            onChange={(e) =>
              setNewLevelForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-[#F2C9A8] bg-[#Fff8ec]/90 px-4 py-2 text-xs text-[#4A2C19] outline-none placeholder:text-[#C09A74] focus:border-[#DE954F] focus:ring-1 focus:ring-[#DE954F]"
            placeholder="Misal: Cerita Naratif Lanjutan"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isBonusLevel"
            type="checkbox"
            checked={newLevelForm.isBonusLevel}
            onChange={(e) =>
              setNewLevelForm((prev) => ({
                ...prev,
                isBonusLevel: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-[#DE954F] text-[#DE954F] focus:ring-[#DE954F]"
          />
          <label
            htmlFor="isBonusLevel"
            className="text-[11px] text-[#8A5B3D]"
          >
            Tandai sebagai level bonus
          </label>
        </div>
        <button
          type="submit"
          className="mt-1 w-full rounded-xl bg-[#DE954F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#c57833] disabled:opacity-60"
          disabled={!newLevelForm.name.trim()}
        >
          Simpan Level
        </button>
      </form>
    </div>
  );
}