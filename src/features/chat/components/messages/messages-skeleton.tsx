import { memo } from 'react';
import { ScrollArea } from '@components/ui/scroll-area';
import { Skeleton } from '@components/ui/skeleton';

const MessagesSkeleton = () => {
  return (
    <ScrollArea
      className="[&_[data-slot=scroll-area-thumb]]:bg-border h-full
        [&_[data-slot=scroll-area-scrollbar]]:w-2.5"
    >
      <div className="mx-auto flex max-w-[840px] flex-col gap-3 space-y-0 py-0 pt-8">
        {/* User Message Skeleton */}
        <div className="group w-full rounded-md bg-transparent px-3.5 py-2.5">
          <div className="ml-auto w-fit max-w-[465px]">
            <div className="py-2.5">
              <Skeleton className="h-5 w-[280px] rounded-[10px] opacity-70" />
            </div>
          </div>
        </div>

        {/* AI Message Skeleton */}
        <div className="group w-full rounded-md bg-transparent px-3.5 pt-0">
          {/* Content skeletons - multiple lines to simulate longer response */}
          <div className="space-y-2 pb-2">
            <Skeleton className="h-5 w-full opacity-70" />
            <Skeleton className="h-5 w-full opacity-70" />
            <Skeleton className="h-5 w-full opacity-70" />
            <Skeleton className="h-5 w-[95%] opacity-70" />
            <Skeleton className="h-5 w-[85%] opacity-70" />
            <Skeleton className="h-5 w-[70%] opacity-70" />
          </div>
        </div>

        {/* Another User Message Skeleton (optional - for more realistic look) */}
        <div className="group w-full rounded-md bg-transparent px-3.5 py-2.5">
          <div className="ml-auto w-fit max-w-[465px]">
            <div className="py-2.5">
              <Skeleton className="h-5 w-[320px] rounded-[10px] opacity-70" />
            </div>
          </div>
        </div>

        {/* Another AI Message Skeleton - shorter */}
        <div className="group w-full rounded-md bg-transparent px-3.5 pt-0">
          {/* Content skeletons */}
          <div className="space-y-2 pb-2">
            <Skeleton className="h-5 w-full opacity-70" />
            <Skeleton className="h-5 w-full opacity-70" />
            <Skeleton className="h-5 w-[90%] opacity-70" />
            <Skeleton className="h-5 w-[60%] opacity-70" />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default memo(MessagesSkeleton);
