export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startMessengerPolling } = await import("@/lib/messengers/poll");
    startMessengerPolling();

    // Best-effort: a DB hiccup at boot (e.g. Postgres still starting up)
    // must never block the whole app from becoming ready, since Next.js
    // awaits register() before serving any requests.
    (async () => {
      try {
        const { prisma } = await import("@/lib/db");
        const { startOrRestartProxy } = await import("@/lib/proxy/xray-manager");
        const vpnConfig = await prisma.vpnConfig.findUnique({ where: { id: 1 } });
        if (vpnConfig?.enabled && vpnConfig.configUrl) {
          await startOrRestartProxy(vpnConfig.configUrl);
        }
      } catch (err) {
        console.error("[xray] startup check failed:", err instanceof Error ? err.message : err);
      }
    })();
  }
}
