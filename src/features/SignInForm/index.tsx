import type { FC } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import Apple from '@/assets/svg/apple.svg';
import GitHub from '@/assets/svg/github.svg';
import Google from '@/assets/svg/google.svg';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Label } from '@/components/Label';
import { Separator } from '@/components/Separator';
import { ThemedP } from '@/components/ThemedP';
import { ThemedSpan } from '@/components/ThemedSpan';

import { LocalStorageKeys } from '@/constants/localStorage';
import { AppRoutes } from '@/constants/router';

import { useSignIn } from '@/hooks/useSignIn';

import { setToStorage } from '@/utils/localStorage';

const signInSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignInForm: FC = () => {
  const navigate = useNavigate();
  const { signIn } = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const handleSignIn = (data: SignInFormData) => {
    signIn(
      { email: data.email, password: data.password },
      {
        onSuccess: data => {
          // eslint-disable-next-line no-console
          console.log('response', data);

          setToStorage(LocalStorageKeys.AccessToken, data.access_token);
          navigate(AppRoutes.Home);
        },
        onError: error => {
          // eslint-disable-next-line no-console
          console.log('error', error);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(handleSignIn)}>
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
          <GitHub className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
        >
          <Google className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
        >
          <Apple className="w-4 h-4" />
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
