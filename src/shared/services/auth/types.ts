export type SignInWithGoogleRequest = {
  code: string;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
};
