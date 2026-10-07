import { Provider } from "../types.ts";
import { createAnthropic } from "./anthropic.ts";
import { createOpenAICompat } from "./openai-compat.ts";
import { createGemini } from "./gemini.ts";
import { createXAI } from "./xai.ts";

const providers: Record<string, () => Provider> = {
    anthropic: createAnthropic,
    openai: () => createOpenAICompat("openai", "https://api.openai.com/v1", process.env.OPENAI_API_KEY, "gpt-4o"),
    groq: () => createOpenAICompat("groq", "https://api.groq.com/openai/v1", process.env.GROQ_API_KEY, "llama3-8b-8192"),
    gemini: createGemini,
    xai: () => createXAI(process.env.XAI_API_KEY)
};

export function getProvider(name: string): Provider {
    const create = providers[name];
    if (!create) {
        throw new Error(`Unknown provider: ${name}. Supported: ${Object.keys(providers).join(", ")}`);
    }
    return create();
}