export interface User {
  id: string;
  name: string
  email: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}