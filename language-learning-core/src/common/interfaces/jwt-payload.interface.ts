/**
 * JWT payload interface.
 * Describes the structure of the decoded JWT token.
 */
export interface JwtPayload {
  /** User ID (subject) */
  sub: string;

  /** User email */
  email: string;

  /** Token issued at timestamp */
  iat?: number;

  /** Token expiration timestamp */
  exp?: number;
}
