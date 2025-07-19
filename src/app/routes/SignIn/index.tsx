import type { FC } from 'react';

import LogoIcon from '@shared/assets/icons/logo.svg';

import { ThemedH1 } from '@shared/components/ThemedH1';
import { ThemedH2 } from '@shared/components/ThemedH2';
import { ThemedP } from '@shared/components/ThemedP';
import { ThemedSpan } from '@shared/components/ThemedSpan';

import ChatTreeIcon from '@features/SignIn/assets/icons/chatTree.svg';
import LogoBackgroundIcon from '@features/SignIn/assets/icons/logoBackground.svg';
import SignInForm from '@features/SignIn/components/SignInForm';

const SignInPage: FC = () => {
  return (
    <div className="min-h-svh flex flex-col p-4 sm:p-6">
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-[360px]">
            <LogoIcon className="mb-6" />
            <div className="flex flex-col gap-3 mb-6">
              <ThemedH2 className="font-bold text-2xl sm:text-3xl">Sign in</ThemedH2>
              <ThemedP className="text-sm text-muted-foreground">
                Log in to unlock tailored content and stay connected with your community.
              </ThemedP>
            </div>
            <SignInForm />
          </div>
        </div>
        <div className="relative overflow-hidden hidden lg:flex flex-1 flex-col gap-12 items-center justify-center bg-[#fafafa] p-8 border-[1px] border-border rounded-xl shadow-[0_1px_20px_0_rgba(0,0,0,0.05)]">
          <ThemedH1 className="text-5xl leading-[140%] max-w-[508px] font-thin">
            <ThemedSpan className="font-normal">Reasoning space</ThemedSpan> for individuals, teams,
            and organizations
          </ThemedH1>
          <ChatTreeIcon className="z-10 max-w-full" />
          <LogoBackgroundIcon className="absolute bottom-0 left-0" />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
