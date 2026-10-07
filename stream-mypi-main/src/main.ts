import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { getProvider } from "./providers/index.ts";
import type { Message } from "./types.ts";
import { runAgent } from "./agent/loop.ts";
import { tools } from "./tools/index.ts";

config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});

const { values } = parseArgs({
  options: {
    prompt: { type: "string", short: "p" },
    provider: { type: "string", default: "anthropic" },
    model: { type: "string" },
  },
});

if (!values.prompt) {
  console.error("Usage: mypi -p \"prompt\" --provider anthropic|openai|gemini|xai|groq [--model model]");
  process.exit(1);
}

const provider = getProvider(values.provider);
const model = values.model ?? provider.defaultModel;
const messages: Message[] = [{ role: "user", content: values.prompt }];

const abortController = new AbortController();

process.on("SIGINT", () => {
  console.log("\nReceived SIGINT, aborting...");
  abortController.abort();
  process.exit(130);
});

try {
  await runAgent({
    provider,
    model,
    tools,
    messages,
    signal: abortController.signal,
    onEvent(event) {
      if (event.type === "text") process.stdout.write(event.delta);
      else if (event.type === "tool_start") console.log(`\n> Running tool: ${event.call.name}`);
      else if (event.type === "tool_end") {
        const lines = event.result.split("\n").length;
        console.log(`\n> Tool finished: ${event.isError ? "Error" : lines + " lines output"}`);
      } else if (event.type === "turn_end") {
        const { usage, stopReason } = event.message;
        console.log(
          `\n\n[${provider.name} | ${model} | In: ${usage.input} Out: ${usage.output} | Stop: ${stopReason}]`,
        );
      }
    },
  });
} catch (error) {
  if (error instanceof Error && error.message === "Aborted") {
    console.error("\nRun aborted by user.");
  } else {
    console.error("\nError during run:", error);
  }
}



