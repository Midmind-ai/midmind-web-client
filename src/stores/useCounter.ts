import { create } from 'zustand';

type CounterStore = {
  count: number;
  increaseCount: () => void;
  resetCount: () => void;
};

const useCounterStore = create<CounterStore>(
  (set): CounterStore => ({
    count: 0,
    increaseCount: () => set(state => ({ count: state.count + 1 })),
    resetCount: () => set({ count: 0 }),
  })
);

export default useCounterStore;
