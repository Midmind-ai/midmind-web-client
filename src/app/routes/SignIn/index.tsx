import type { FC } from 'react';

import ChatTree from '@/assets/svg/chat-tree.svg';
import Logo from '@/assets/svg/logo.svg';

import { ThemedH1 } from '@/components/ThemedH1';
import { ThemedH2 } from '@/components/ThemedH2';
import { ThemedP } from '@/components/ThemedP';
import { ThemedSpan } from '@/components/ThemedSpan';

import SignInForm from '@/features/SignInForm';

const SignInPage: FC = () => {
  return (
    <div className="min-h-svh max-w-[1280px] mx-auto flex flex-col">
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-[360px]">
            <Logo className="mb-6" />
            <div className="flex flex-col gap-3 mb-6">
              <ThemedH2 className="font-bold text-2xl sm:text-3xl">Sign in</ThemedH2>
              <ThemedP className="text-sm text-muted-foreground">
                Log in to unlock tailored content and stay connected with your community.
              </ThemedP>
            </div>
            <SignInForm />
          </div>
        </div>
        <div className="hidden lg:flex flex-1 flex-col gap-12 items-center justify-center p-12">
          <ThemedH1 className="text-[30px] max-w-[508px] font-thin">
            <ThemedSpan className="font-normal">Reasoning space</ThemedSpan> for individuals, teams,
            and organizations
          </ThemedH1>
          <ChatTree />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
