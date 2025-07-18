import useSWRMutation from 'swr/mutation';

import { authAxiosInstance } from '@/config/axios';

import { ApiEndpoints } from '@/constants/api';

type SignInResponse = {
  access_token: string;
};

type SignInRequestBody = {
  email: string;
  password: string;
};

type FetcherArgs = {
  arg: SignInRequestBody;
};

const fetcher = async (url: string, { arg }: FetcherArgs) => {
  const response = await authAxiosInstance.post<SignInResponse>(url, arg);

  return response.data;
};

export const useSignIn = () => {
  const {
    trigger: signIn,
    isMutating: isLoading,
    error,
  } = useSWRMutation(ApiEndpoints.SignIn, fetcher);

  return { signIn, isLoading, error };
};
