import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env";

let _client: Anthropic | null = null;
export function anthropic() {
  if (_client) return _client;
  _client = new Anthropic({ apiKey: env.anthropicApiKey() });
  return _client;
}

export type CallResult = {
  text: string;
  inputTokens?: number;
  outputTokens?: number;
  durationMs: number;
};

export async function callClaude(params: {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<CallResult> {
  const start = Date.now();
  const resp = await anthropic().messages.create({
    model: env.claudeModel(),
    max_tokens: params.maxTokens ?? 4000,
    temperature: params.temperature ?? 0.3,
    messages: [{ role: "user", content: params.prompt }],
  });
  const text = resp.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");
  return {
    text,
    inputTokens: resp.usage?.input_tokens,
    outputTokens: resp.usage?.output_tokens,
    durationMs: Date.now() - start,
  };
}
