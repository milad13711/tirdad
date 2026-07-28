import bcrypt from "bcryptjs";

const OTP_LENGTH = 5;
const OTP_TTL_MINUTES = 3;
const SALT_ROUNDS = 10;

export function generateOtpCode(): string {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export function otpExpiryDate(): Date {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}

export async function hashOtpCode(code: string): Promise<string> {
  return bcrypt.hash(code, SALT_ROUNDS);
}

export async function verifyOtpCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

const IRAN_MOBILE_REGEX = /^09\d{9}$/;

export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim().replace(/[^\d]/g, "");
  const withZero = trimmed.startsWith("98") ? `0${trimmed.slice(2)}` : trimmed;
  return IRAN_MOBILE_REGEX.test(withZero) ? withZero : null;
}
