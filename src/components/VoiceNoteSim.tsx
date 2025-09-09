export default function VoiceNoteSim({ sent, setSent }: { sent: boolean; setSent: (sent: boolean) => void }) {
  return (
    <div className="flex flex-col items-center">
      {!sent ? (
        <button
          className="py-2 px-6 bg-red-500 text-white rounded"
          onClick={() => setSent(true)}
        >
          Rekam & Kirim Voice Note (simulasi)
        </button>
      ) : (
        <span className="text-gray-700">Voice note sedang diproses...</span>
      )}
    </div>
  );
}