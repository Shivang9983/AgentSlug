import { createOpenAICompat } from "./openai-compat.ts";

export function createXAI(apiKey?: string) {
  return createOpenAICompat("xai", "https://api.x.ai/v1", apiKey, "grok-beta");
}
