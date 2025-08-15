import { Button } from '@components/ui/button';

import { useSWRCacheInspector } from '@hooks/utils/use-swr-cache-inspector';

const DevTools = () => {
  const { inspectCache } = useSWRCacheInspector();

  return (
    <Button
      size="sm"
      onClick={inspectCache}
      variant="outline"
      className="fixed right-4 bottom-4 z-[9999] opacity-50 transition-opacity
        hover:opacity-100"
      title="Inspect SWR Cache (Alt+Shift+C)"
    >
      🔍 SWR
    </Button>
  );
};

export default DevTools;
