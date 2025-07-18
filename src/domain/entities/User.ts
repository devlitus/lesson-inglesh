export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Opcional para no exponer en respuestas
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}