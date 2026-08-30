export function SkeletonLine({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="space-y-3">
        <SkeletonLine className="h-5 w-3/4" />
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <SkeletonLine className="h-6 w-20 rounded-full" />
          <SkeletonLine className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-1 skeleton" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-9 w-9 rounded-lg" />
        </div>
        <SkeletonLine className="h-8 w-16" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="page-container">
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonLine className="h-7 w-48" />
            <SkeletonLine className="h-4 w-64" />
          </div>
          <SkeletonLine className="h-10 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        <SkeletonLine className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="page-container">
      <div className="animate-fade-in space-y-4">
        <div className="space-y-2">
          <SkeletonLine className="h-7 w-48" />
          <SkeletonLine className="h-4 w-32" />
        </div>
        {[...Array(count)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="page-container">
      <div className="animate-fade-in space-y-6">
        <SkeletonLine className="h-5 w-40" />
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <SkeletonLine className="h-7 w-64" />
            <SkeletonLine className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <SkeletonLine className="h-6 w-24 rounded-full" />
            <SkeletonLine className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <SkeletonLine className="h-5 w-28 mb-4" />
              <div className="space-y-2">
                <SkeletonLine className="h-4 w-full" />
                <SkeletonLine className="h-4 w-full" />
                <SkeletonLine className="h-4 w-3/4" />
              </div>
            </div>
            <div className="card p-6">
              <SkeletonLine className="h-5 w-20 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <SkeletonLine className="h-3 w-16" />
                    <SkeletonLine className="h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card p-6">
            <SkeletonLine className="h-5 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <SkeletonLine className="h-3 w-3 rounded-full mt-1" />
                  <div className="flex-1 space-y-1">
                    <SkeletonLine className="h-3 w-24" />
                    <SkeletonLine className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
