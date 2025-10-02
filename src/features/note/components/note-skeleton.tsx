/**
 * Loading skeleton for note page
 */
export const NoteSkeleton = () => {
  return (
    <div className="flex h-full animate-pulse flex-col">
      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 py-10">
          {/* Title skeleton */}
          <div className="h-12 w-2/3 rounded bg-gray-200" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-4">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-4/6 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
