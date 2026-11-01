export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-[120px] animate-pulse rounded-2xl border border-line bg-[#0a1220]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[92px] animate-pulse rounded-2xl border border-line bg-[#0a1220]" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.62fr_1fr]">
        <div className="h-[320px] animate-pulse rounded-2xl border border-line bg-[#0a1220]" />
        <div className="h-[320px] animate-pulse rounded-2xl border border-line bg-[#0a1220]" />
      </div>
    </div>
  );
}
