# AgentSlug

**A multi-provider AI agent for your terminal.**

AgentSlug is a TypeScript/Node.js CLI agent that lets you interact with different LLM providers from your terminal and give them access to useful developer tools.

Instead of being tied to a single AI provider, AgentSlug provides a common agent interface for multiple providers while keeping provider-specific API logic isolated.

## ✨ Features

- 🤖 **Multi-provider LLM support**
  - OpenAI
  - Anthropic
  - Google Gemini
  - xAI / Grok

- ⚡ **Streaming responses**
- 🔧 **Tool calling**
- 💻 **Terminal/shell execution**
- 📁 **Filesystem tools**
- 🔎 **File and text search**
- 🧩 **Provider abstraction**
- 🦾 **TypeScript-first architecture**
- 🚀 **CLI-based workflow**
- 🔌 Designed to make adding new providers and tools straightforward

## 🏗️ Architecture

AgentSlug separates the agent loop, providers, and tools.

```text
                    ┌──────────────────┐
                    │     AgentSlug    │
                    │       CLI        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Agent Loop    │
                    └────────┬─────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
          ┌───────────────┐      ┌───────────────┐
          │   Providers   │      │     Tools     │
          └───────┬───────┘      └───────┬───────┘
                  │                      │
       ┌──────────┼──────────┐      ┌────┼────┬────┐
       ▼          ▼          ▼      ▼    ▼    ▼    ▼
    OpenAI    Anthropic   Gemini   Bash Read Grep Find
                              │
                             xAI
```

The agent loop works with normalized internal types instead of depending directly on provider-specific response formats.

This makes it easier to add or replace providers without rewriting the core agent.

## 📂 Project Structure

```text
AgentSlug/
├── bin/
│   └── mypi.js
│
├── src/
│   ├── agent/
│   │   └── loop.ts
│   │
│   ├── providers/
│   │   ├── anthropic.ts
│   │   ├── gemini.ts
│   │   ├── index.ts
│   │   ├── openai-compat.ts
│   │   └── xai.ts
│   │
│   ├── tools/
│   │   ├── bash.ts
│   │   ├── find.ts
│   │   ├── fsutil.ts
│   │   ├── grep.ts
│   │   ├── index.ts
│   │   ├── ls.ts
│   │   ├── read.ts
│   │   └── stat.ts
│   │
│   ├── main.ts
│   └── types.ts
│
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Requirements

- Node.js 18+
- An API key for at least one supported provider

### Installation

Clone the repository:

```bash
git clone https://github.com/Shivang9983/AgentSlug.git
cd AgentSlug
```

Install dependencies:

```bash
npm install
```

## 🔑 Environment Variables

Create a `.env` file and configure the provider credentials you want to use.

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
XAI_API_KEY=
```

Only configure the providers you actually use.

**Never commit your `.env` file or API keys to Git.**

## ▶️ Running AgentSlug

During development:

```bash
npm run dev
```

Depending on the CLI configuration, select the provider/model using the available CLI options.

For example:

```bash
npm run dev -- --provider gemini
```

or:

```bash
npm run dev -- --provider anthropic
```

You can also use:

```bash
npm run dev -- --provider openai
```

and:

```bash
npm run dev -- --provider xai
```

Check the CLI help for the currently supported options:

```bash
npm run dev -- --help
```

## 🧰 Available Tools

AgentSlug currently provides tools for interacting with the local development environment.

### Bash

Execute shell commands.

```text
bash
```

### Read

Read file contents.

```text
read
```

### Grep

Search for text/patterns across files.

```text
grep
```

### Find

Find files in the workspace.

```text
find
```

### LS

List directory contents.

```text
ls
```

### Stat

Inspect filesystem metadata.

```text
stat
```

These tools allow the LLM to inspect and interact with a codebase instead of only generating text.

## 🔄 Agent Loop

The core workflow is:

```text
User
  │
  ▼
AgentSlug
  │
  ▼
LLM Provider
  │
  ├──── Text response ──────► User
  │
  └──── Tool call
           │
           ▼
      Tool execution
           │
           ▼
       Tool result
           │
           ▼
      LLM Provider
           │
           ▼
       Final response
```

The agent can therefore perform multiple tool calls before producing its final response.

## 🌐 Provider Architecture

AgentSlug keeps provider-specific logic isolated.

```text
                 Agent Loop
                     │
              Provider Interface
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
    OpenAI       Anthropic       Gemini
                                  │
                                  ▼
                                  xAI
```

Each provider is responsible for translating its API's request/response format into AgentSlug's internal representation.

This prevents the agent loop from becoming tightly coupled to a specific LLM provider.

## 🛠️ Development

Run the project in development mode:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## 🧪 Testing

The project is designed to keep provider-specific functionality separate from the core agent loop so that the agent and tool execution logic can be tested independently of live LLM APIs.

Provider API calls should not be required for normal unit tests.

## 🔐 Security

AgentSlug can execute tools against the local environment.

This means you should treat the agent as a **trusted local developer tool**.

In particular, shell execution can be dangerous because an LLM may generate commands that modify or delete files, install software, or interact with the operating system.

Do not run AgentSlug with access to sensitive environments unless you understand and trust the tools being exposed to the model.

## 🎯 Why AgentSlug?

Most LLM applications are tightly coupled to one provider.

AgentSlug takes a different approach:

```text
             ┌─────────────┐
             │  AgentSlug  │
             └──────┬──────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
     OpenAI     Anthropic     Gemini
                                │
                                ▼
                               xAI
```

The provider can change without changing the fundamental agent workflow.

This makes AgentSlug useful as a foundation for experimenting with:

- LLM agents
- tool calling
- provider abstractions
- streaming APIs
- developer automation
- AI-assisted coding workflows

## 🗺️ Roadmap

Planned improvements include:

- [ ] Strong runtime validation for tool arguments
- [ ] Improved tool permission/safety controls
- [ ] Better error handling
- [ ] Graceful cancellation with `AbortController`
- [ ] More comprehensive test coverage
- [ ] Improved CLI UX
- [ ] Additional LLM providers
- [ ] More developer tools
- [ ] Configurable agent/tool limits
- [ ] Better logging and diagnostics
- [ ] Production-ready packaging

## 🤝 Contributing

Contributions, issues, and ideas are welcome.

If you want to add a provider, the preferred approach is to implement the provider behind the existing provider abstraction rather than adding provider-specific logic to the agent loop.

## 📄 License

Add the project's chosen license here.

---

**AgentSlug — one CLI, multiple LLM providers, real developer tools.**