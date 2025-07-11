export interface User {
  id: string;
  name?: string; // Opcional, obtener del servidor cuando sea necesario
  email?: string; // Opcional, obtener del servidor cuando sea necesario
}

// AuthSession solo para uso en memoria, NUNCA persistir
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}