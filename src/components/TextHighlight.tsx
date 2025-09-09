export default function TextHighlight({ text, highlighted, onClick }: { text: string; highlighted: boolean; onClick: () => void }) {
  return (
    <span
      className={`block my-2 p-2 rounded transition cursor-pointer ${highlighted ? "bg-yellow-200 font-bold" : "bg-gray-100"}`}
      onClick={onClick}
    >
      {text}
    </span>
  );
}