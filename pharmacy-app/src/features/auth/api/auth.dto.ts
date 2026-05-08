export type LoginCredentialsDto = {
  username: string;
  password: string;
};

export type AuthTokenResponseDto = {
  accessToken: string;
};

export type LogoutResponseDto = Record<string, never>;
