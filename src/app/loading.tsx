export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-cream px-6 py-12 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-16 rounded-[2rem] bg-pine-500/10" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 rounded-[2rem] bg-pine-500/10" />
          <div className="h-96 rounded-[2rem] bg-pine-500/10" />
        </div>
      </div>
    </div>
  );
}