import { randomInt, randomBytes } from "crypto";

// Uppercase alphanumeric, excluding visually ambiguous characters (0/O, 1/I/L).
const SHORT_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const SHORT_CODE_LENGTH = 7;

export function generateShortCode(): string {
  let code = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    code += SHORT_CODE_ALPHABET[randomInt(SHORT_CODE_ALPHABET.length)];
  }
  return code;
}

export function generateConfirmToken(): string {
  return randomBytes(32).toString("hex");
}
