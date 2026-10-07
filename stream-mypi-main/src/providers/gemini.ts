import { GoogleGenAI, Type } from "@google/genai";
import type { Provider, StreamOptions, StopReason, Message, ContentBlock } from "../types.ts";

function toGemini(messages: Message[]) {
  return messages.map((m) => {
    if (m.role === "user") return { role: "user", parts: [{ text: m.content }] };
    if (m.role === "assistant") {
      return {
        role: "model",
        parts: m.content.map((b) =>
          b.type === "text"
            ? { text: b.text }
            : { functionCall: { name: b.name, args: b.arguments } },
        ),
      };
    }
    return {
      role: "user",
      parts: [
        {
          functionResponse: {
            name: m.toolName,
            response: { result: m.isError ? `Error: ${m.content}` : m.content },
          },
        },
      ],
    };
  });
}

export function createGemini(): Provider {
  const ai = new GoogleGenAI({});
  return {
    name: "gemini",
    defaultModel: "gemini-2.5-flash",
    async *stream({ messages, model, system, tools = [], signal }) {
      const formattedTools = tools.length
        ? [
            {
              functionDeclarations: tools.map((t) => ({
                name: t.name,
                description: t.description,
                parameters: {
                  type: Type.OBJECT,
                  properties: (t.parameters as any).properties || {},
                  required: (t.parameters as any).required || [],
                },
              })),
            },
          ]
        : undefined;

      const stream = await ai.models.generateContentStream({
        model,
        contents: toGemini(messages) as any,
        config: {
          systemInstruction: system,
          tools: formattedTools as any,
        },
      });

      let text = "";
      const content: ContentBlock[] = [];
      let inputTokens = 0;
      let outputTokens = 0;
      let stopReason: StopReason = "stop";

      for await (const chunk of stream) {
        if (signal?.aborted) throw new Error("Aborted");

        if (chunk.text) {
          text += chunk.text;
          yield { type: "text_delta", delta: chunk.text };
        }

        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          for (const call of chunk.functionCalls) {
            content.push({
              type: "toolCall",
              id: (call.name || "call") + "_" + Math.random().toString(36).substring(7),
              name: call.name || "unknown",
              arguments: (call.args as Record<string, unknown>) || {},
            });
          }
        }

        if (chunk.usageMetadata) {
          inputTokens = chunk.usageMetadata.promptTokenCount ?? 0;
          outputTokens = chunk.usageMetadata.candidatesTokenCount ?? 0;
        }

        if (chunk.candidates && chunk.candidates[0]?.finishReason) {
          const reason = chunk.candidates[0].finishReason;
          if (reason === "STOP") stopReason = content.some(b => b.type === "toolCall") ? "toolUse" : "stop";
          else if (reason === "MAX_TOKENS") stopReason = "length";
        }
      }
      
      if (text) {
        content.unshift({ type: "text", text });
      }

      yield {
        type: "done",
        message: {
          role: "assistant",
          content,
          usage: { input: inputTokens, output: outputTokens },
          stopReason,
        },
      };
    },
  };
}
