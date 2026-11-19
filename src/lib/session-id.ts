"use client";

const KEY = "tirdad_session_id";

export function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    // Private browsing / blocked storage — fall back to a per-mount id;
    // tracking just won't persist across page loads for this visitor.
    return crypto.randomUUID();
  }
}
