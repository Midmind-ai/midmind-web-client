import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import useCounterStore from '@/stores/useCounter';

const App: FC = () => {
  const { count, increaseCount, resetCount } = useCounterStore();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button onClick={increaseCount}>Click me</Button>
      <p>Count: {count}</p>
      <Button onClick={resetCount}>Reset</Button>
    </div>
  );
};

export default App;
