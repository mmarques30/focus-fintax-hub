export function SkeletonKpi() {
  return (
    <div className="grid grid-cols-5 gap-3 mb-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card-base p-4 animate-pulse">
          <div className="h-2 w-16 bg-ink-06 rounded-full mb-3" />
          <div className="h-7 w-20 bg-ink-06 rounded-full mb-2" />
          <div className="h-2 w-14 bg-ink-06 rounded-full" />
        </div>
      ))}
    </div>
  );
}
