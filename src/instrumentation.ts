export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startMessengerPolling } = await import("@/lib/messengers/poll");
    startMessengerPolling();
  }
}
