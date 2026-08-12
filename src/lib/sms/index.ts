import type { SmsProvider } from "./provider";
import { mockSmsProvider } from "./mock";
import { limoSmsProvider } from "./limo";

// limoSmsProvider already falls back to console-logging the code (like
// mockSmsProvider) when neither a pattern nor a saved LimoSMS connection is
// configured, so it's always safe to use — no env var needed to opt in.
// SMS_PROVIDER=mock stays available as an explicit override (e.g. tests).
export function getSmsProvider(): SmsProvider {
  return process.env.SMS_PROVIDER === "mock" ? mockSmsProvider : limoSmsProvider;
}
