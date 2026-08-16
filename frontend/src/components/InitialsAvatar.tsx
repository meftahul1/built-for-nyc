const PALETTE = [
  "bg-rose-100 text-rose-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function InitialsAvatar({ name, className = "h-10 w-10 text-sm" }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const palette = PALETTE[hashString(name) % PALETTE.length];

  return (
    <div className={`flex items-center justify-center rounded-full font-extrabold flex-shrink-0 ${palette} ${className}`}>
      {initials || "?"}
    </div>
  );
}
