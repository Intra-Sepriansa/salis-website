export function ProductSkeleton() {
  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="h-44 w-full rounded-2xl skeleton-contrast animate-pulse opacity-90" />
      <div className="h-4 w-3/4 rounded-full skeleton-contrast animate-pulse opacity-80" />
      <div className="h-3 w-1/2 rounded-full skeleton-contrast animate-pulse opacity-70" />
      <div className="mt-auto h-6 w-1/3 rounded-full skeleton-contrast animate-pulse opacity-80" />
    </div>
  )
}

export default ProductSkeleton
