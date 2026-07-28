import type { SmsProvider } from "./provider";
import { mockSmsProvider } from "./mock";
import { limoSmsProvider } from "./limo";

export function getSmsProvider(): SmsProvider {
  switch (process.env.SMS_PROVIDER) {
    case "limo":
      return limoSmsProvider;
    case "mock":
    default:
      return mockSmsProvider;
  }
}
