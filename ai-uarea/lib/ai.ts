// ─────────────────────────────────────────────────────────────────────────────
// Minimal multi-provider LLM client.
// Only used by the "AI ออกแบบ flow" endpoint; every call is optional and always
// falls back to the deterministic heuristic when no key is configured or the
// provider errors, so the platform keeps working with zero external keys.
// ─────────────────────────────────────────────────────────────────────────────

export type LlmProvider = "anthropic" | "google" | "openai";

export interface LlmRequest {
  system: string;
  prompt: string;
  provider?: LlmProvider;
  model?: string;
  maxTokens?: number;
}

export function configuredProviders(): LlmProvider[] {
  const list: LlmProvider[] = [];
  if (process.env.ANTHROPIC_API_KEY) list.push("anthropic");
  if (process.env.GEMINI_API_KEY) list.push("google");
  if (process.env.OPENAI_API_KEY) list.push("openai");
  return list;
}

export const aiConfigured = () => configuredProviders().length > 0;

function extractJson(text: string): unknown | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start < 0) return null;
  const end = Math.max(candidate.lastIndexOf("]"), candidate.lastIndexOf("}"));
  if (end < start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function post(url: string, init: RequestInit, ms = 30_000): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
}

export async function completeJson<T>(req: LlmRequest): Promise<T | null> {
  const providers = configuredProviders();
  const provider = req.provider && providers.includes(req.provider) ? req.provider : providers[0];
  if (!provider) return null;

  try {
    if (provider === "anthropic") {
      const res = await post("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY as string,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: req.model || "claude-sonnet-4-5",
          max_tokens: req.maxTokens ?? 2000,
          system: req.system,
          messages: [{ role: "user", content: req.prompt }],
        }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = (data.content ?? []).map((c) => c.text ?? "").join("\n");
      return (extractJson(text) as T) ?? null;
    }

    if (provider === "google") {
      const model = req.model || "gemini-3-pro";
      const res = await post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: req.system }] },
            contents: [{ role: "user", parts: [{ text: req.prompt }] }],
            generationConfig: { maxOutputTokens: req.maxTokens ?? 2000, responseMimeType: "application/json" },
          }),
        },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("\n");
      return (extractJson(text) as T) ?? null;
    }

    // OpenAI-compatible (OpenAI, DeepSeek, Zhipu GLM, Ollama)
    const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const res = await post(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: req.model || "gpt-5.1",
        max_tokens: req.maxTokens ?? 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: req.system },
          { role: "user", content: req.prompt },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? "";
    return (extractJson(text) as T) ?? null;
  } catch {
    return null;
  }
}
