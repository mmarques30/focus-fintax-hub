export function SkeletonChart() {
  const barHeights = [40, 65, 50, 80, 55, 70];
  return (
    <div className="card-base p-6 animate-pulse">
      <div className="h-3 w-32 bg-ink-06 rounded-full mb-6" />
      <div className="flex items-end gap-4 h-40">
        {barHeights.map((h, i) => (
          <div key={i} className="flex-1 bg-ink-06 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
