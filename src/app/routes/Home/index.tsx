import type { FC } from 'react';

import axios from 'axios';
import { Link } from 'react-router';
import useSWR from 'swr';

import { Button } from '@/components/Button';

import useCounterStore from '@/stores/useCounter';

import type { User } from '@/types/user';

const fetcher = (url: string) => axios.get<User[]>(url).then(res => res.data);

const Home: FC = () => {
  const { count, increaseCount, resetCount } = useCounterStore();

  const {
    data: users,
    error,
    isLoading,
  } = useSWR('https://jsonplaceholder.typicode.com/users', fetcher);

  return (
    <div className="min-h-sv p-8">
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="mb-12 text-center">
          <div className="mb-6">
            <span className="text-6xl font-thin text-gray-700">{count}</span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={increaseCount}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors"
            >
              Increase
            </Button>
            <Button
              onClick={resetCount}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="mb-12 w-full max-w-md">
          <h2 className="mb-4 text-2xl font-light text-gray-800 text-center">Users</h2>
          {isLoading && <div className="text-center text-gray-600">Loading users...</div>}
          {error && <div className="text-center text-red-600">Failed to load users</div>}
          {users && (
            <div className="space-y-2">
              {users.slice(0, 3).map(user => (
                <div
                  key={user.id}
                  className="p-3 bg-white rounded-md shadow-sm border border-gray-200"
                >
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Link
            to="/auth"
            className="text-gray-600 hover:text-gray-800 underline underline-offset-4 transition-colors"
          >
            Go to Auth
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
