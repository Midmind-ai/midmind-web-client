import { Link } from 'react-router';

import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Separator } from '@components/ui/separator';
import { ThemedP } from '@components/ui/themed-p';
import { ThemedSpan } from '@components/ui/themed-span';

import { AppRoutes } from '@constants/paths';

import AppleIcon from '@features/sign-in/assets/icons/apple.svg';
import GitHubIcon from '@features/sign-in/assets/icons/github.svg';
import GoogleIcon from '@features/sign-in/assets/icons/google.svg';
import { useSignInFormLogic } from '@features/sign-in/components/sign-in-form/use-sign-in-form-logic';

const SignInForm = () => {
  const { errors, isSubmitting, register, handleSubmit, loginWithGoogle } =
    useSignInFormLogic();

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
            type="email"
            placeholder="Email"
            {...register('email')}
            aria-invalid={!!errors.email?.message}
          />
          {errors.email && (
            <ThemedP className="text-destructive mt-1 text-sm">
              {errors.email.message}
            </ThemedP>
          )}
        </div>
        <div>
          <div className="mb-2 flex justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to={AppRoutes.ForgotPassword}
              className="text-muted-foreground text-sm underline"
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
            <ThemedP className="text-destructive mt-1 text-sm">
              {errors.password.message}
            </ThemedP>
          )}
        </div>
      </div>
      <Button
        type="submit"
        className="mt-6 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
      <div className="relative my-4 text-center">
        <Separator className="absolute top-1/2 left-0 h-px w-full" />
        <ThemedSpan
          className="bg-background text-muted-foreground relative z-10 px-2 text-xs"
        >
          OR
        </ThemedSpan>
      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
        >
          <GitHubIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={loginWithGoogle}
        >
          <GoogleIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
        >
          <AppleIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-6 text-center text-sm">
        <ThemedSpan className="text-muted-foreground">Don't have an account?</ThemedSpan>{' '}
        <Link
          to={AppRoutes.SignUp}
          className="text-primary text-sm underline"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
};

export default SignInForm;
