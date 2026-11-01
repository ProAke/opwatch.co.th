// Node-runtime scheduler ticker (imported only from instrumentation.ts).
import { runDueSchedules } from "./scheduler";

const g = globalThis as unknown as { __uareaTicker?: ReturnType<typeof setInterval> };

if (!g.__uareaTicker) {
  g.__uareaTicker = setInterval(async () => {
    try {
      const res = await runDueSchedules();
      if (res.fired.length) {
        console.log(`[scheduler] fired ${res.fired.length} schedule(s): ${res.fired.map((f) => f.name).join(", ")}`);
      }
    } catch (err) {
      console.error("[scheduler] tick failed:", (err as Error).message);
    }
  }, 60_000);
  g.__uareaTicker.unref?.();
  console.log("[scheduler] zero-touch ticker started (60s)");
}
