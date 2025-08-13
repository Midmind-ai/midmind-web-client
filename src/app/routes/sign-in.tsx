import ChatTreeIcon from '@features/sign-in/assets/icons/chat-tree.svg';
import LogoBackgroundIcon from '@features/sign-in/assets/icons/logo-background.svg';
import SignIn from '@features/sign-in/sign-in';

import LogoIcon from '@/assets/icons/logo.svg';
import { ThemedH1 } from '@/components/ui/themed-h1';
import { ThemedH2 } from '@/components/ui/themed-h2';
import { ThemedP } from '@/components/ui/themed-p';
import { ThemedSpan } from '@/components/ui/themed-span';

const SignInPage = () => {
  return (
    <div className="flex min-h-svh flex-col p-6 sm:p-6">
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-[360px]">
            <LogoIcon className="mb-6" />
            <div className="mb-6 flex flex-col gap-3">
              <ThemedH2 className="text-2xl font-bold sm:text-3xl">Sign in</ThemedH2>
              <ThemedP className="text-muted-foreground text-sm">
                Log in to unlock tailored content and stay connected with your community.
              </ThemedP>
            </div>
            <SignIn />
          </div>
        </div>
        <div
          className="border-border relative hidden flex-1 flex-col items-center
            justify-center gap-12 overflow-hidden rounded-xl border-[1px] bg-[#fafafa] p-8
            shadow-[0_1px_20px_0_rgba(0,0,0,0.05)] lg:flex"
        >
          <ThemedH1 className="max-w-[508px] text-5xl leading-[140%] font-thin">
            <ThemedSpan className="font-normal">Reasoning space</ThemedSpan> for
            individuals, teams, and organizations
          </ThemedH1>
          <ChatTreeIcon className="z-10 max-w-full" />
          <LogoBackgroundIcon className="absolute bottom-0 left-0" />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
