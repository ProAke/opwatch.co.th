// Built-in ticker: checks due schedules every 60 seconds so the console keeps
// working without external infrastructure. Disable with AUTO_SCHEDULER=off.
// The Node-only import lives behind NEXT_RUNTIME so the edge bundle never
// touches mysql2 (see Next.js instrumentation docs).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.AUTO_SCHEDULER === "off") return;
    await import("./lib/ticker");
  }
}
