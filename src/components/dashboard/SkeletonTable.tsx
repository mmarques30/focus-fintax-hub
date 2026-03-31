export function SkeletonTable() {
  return (
    <div className="card-base p-4 animate-pulse">
      <div className="h-3 w-28 bg-ink-06 rounded-full mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          <div className="h-3 w-1/4 bg-ink-06 rounded-full" />
          <div className="h-3 w-1/4 bg-ink-06 rounded-full" />
          <div className="h-3 w-1/4 bg-ink-06 rounded-full" />
          <div className="h-3 w-1/4 bg-ink-06 rounded-full" />
        </div>
      ))}
    </div>
  );
}
