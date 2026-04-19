import { randomBytes } from "crypto";

// Opaque, URL-safe tokens used for magic links (assessment, parent dashboard).
export function newToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}
