const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function groqChat(options: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  json?: boolean;
  timeoutMs?: number;
}): Promise<string | null> {
  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) return null;

  const model = process.env["GROQ_MODEL"] ?? "llama-3.3-70b-versatile";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: options.temperature ?? 0.2,
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
        messages: options.messages,
      }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return payload.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
