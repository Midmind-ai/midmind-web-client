import type { FC } from 'react';
import { Link } from 'react-router';

const Auth: FC = () => {
  return (
    <div className="min-h-svh bg-gray-50 p-8">
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="mb-16 text-center">
          <h1 className="mb-2 text-4xl font-light text-gray-800">Auth</h1>
        </div>

        <div>
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 underline underline-offset-4 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
