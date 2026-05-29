// Augments Clerk's session claims so `auth().sessionClaims.metadata.role` is typed.
// Operators are flagged by setting publicMetadata.role = "operator" on the Clerk user.
export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: "operator";
    };
  }
}
