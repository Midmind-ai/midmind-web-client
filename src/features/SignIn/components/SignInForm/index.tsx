import type { FC } from 'react';

import { Link } from 'react-router';

import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { Label } from '@shared/components/Label';
import { Separator } from '@shared/components/Separator';
import { ThemedP } from '@shared/components/ThemedP';
import { ThemedSpan } from '@shared/components/ThemedSpan';

import { AppRoutes } from '@shared/constants/router';

import AppleIcon from '@features/SignIn/assets/icons/apple.svg';
import GitHubIcon from '@features/SignIn/assets/icons/github.svg';
import GoogleIcon from '@features/SignIn/assets/icons/google.svg';
import { useSignInFormLogic } from '@features/SignIn/components/SignInForm/useSignInFormLogic';

const SignInForm: FC = () => {
  const { errors, isSubmitting, register, handleSubmit } = useSignInFormLogic();

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <Label
            htmlFor="email"
            className="mb-2"
          >
            Email
          </Label>
          <Input
            id="email"
            placeholder="Email"
            {...register('email')}
            aria-invalid={!!errors.email?.message}
          />
          {errors.email && (
            <ThemedP className="text-sm text-destructive mt-1">{errors.email.message}</ThemedP>
          )}
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="password">Password</Label>
            <Link
              to={AppRoutes.ForgotPassword}
              className="underline text-sm text-muted-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            {...register('password')}
            aria-invalid={!!errors.password?.message}
          />
          {errors.password && (
            <ThemedP className="text-sm text-destructive mt-1">{errors.password.message}</ThemedP>
          )}
        </div>
      </div>
      <Button
        type="submit"
        className="w-full mt-6"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
      <div className="relative text-center my-4">
        <Separator className="absolute top-1/2 left-0 w-full h-px" />
        <ThemedSpan className="relative z-10 bg-background px-2 text-muted-foreground text-xs">
          OR
        </ThemedSpan>
      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
        >
          <GitHubIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
        >
          <GoogleIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
        >
          <AppleIcon className="w-4 h-4" />
        </Button>
      </div>
      <div className="mt-6 text-center text-sm">
        <ThemedSpan className="text-muted-foreground">Don't have an account?</ThemedSpan>{' '}
        <Link
          to={AppRoutes.SignUp}
          className="underline text-sm text-primary"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
};

export default SignInForm;
