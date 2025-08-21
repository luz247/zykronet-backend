export interface JwtPayload {
  sub: string; // O usa "sub: string" si prefieres estándar
  email?: string;
  // roles?: string[];
}