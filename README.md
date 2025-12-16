# Ordis CLI

Ordis is a local-first CLI tool that turns messy, unstructured text into clean, structured data using a schema-driven extraction pipeline powered by LLMs. You give it a schema that describes the fields you expect, point it at some raw text, and choose any OpenAI-compatible model. Ordis builds the prompt, calls the model, validates the output, and returns either a correct structured record or a clear error.

**Ordis does for LLM extraction what Prisma does for databases: strict schemas, predictable output and no more glue code.**

## Status

**✅ CLI functional** - Core extraction pipeline working with real LLMs. Ready for testing and feedback.

## Features

- **Local-first extraction**: Supports Ollama, LM Studio, or any OpenAI-compatible endpoint
- **Schema-first workflow**: Define your data structure upfront
- **Deterministic output**: Returns validated records or structured failures
- **Minimal CLI**: Fast experimentation with simple commands

## Example

```bash
ordis extract \
  --schema examples/invoice.schema.json \
  --input examples/invoice.txt \
  --base http://localhost:11434/v1 \
  --model llama3.1:8b \
  --debug
```

**Sample schema** (`invoice.schema.json`):

```json
{
  "fields": {
    "invoice_id": { "type": "string" },
    "amount": { "type": "number" },
    "currency": { "type": "string", "enum": ["USD", "SGD", "EUR"] },
    "date": { "type": "date", "optional": true }
  }
}
```

## Model Compatibility

Works with any service exposing an OpenAI-compatible API:

- Ollama
- LM Studio
- OpenRouter
- Mistral
- Groq
- OpenAI
- vLLM servers

## Installation

```bash
git clone https://github.com/ordis-dev/ordis-cli
cd ordis-cli
npm install
npm run build
```

Run the CLI:

```bash
node dist/cli.js --help
```

## What Works

- ✅ Schema loader and validator
- ✅ Prompt builder with confidence scoring
- ✅ Universal LLM client (OpenAI-compatible APIs)
- ✅ Structured error system
- ✅ CLI extraction command
- ✅ Field-level confidence tracking

## Roadmap

- [ ] Config file support ([#16](https://github.com/ordis-dev/ordis-cli/issues/16))
- [ ] Output formatting options ([#14](https://github.com/ordis-dev/ordis-cli/issues/14))
- [ ] Batch extraction ([#19](https://github.com/ordis-dev/ordis-cli/issues/19))
- [ ] More example schemas ([#13](https://github.com/ordis-dev/ordis-cli/issues/13))
- [ ] Performance benchmarks ([#18](https://github.com/ordis-dev/ordis-cli/issues/18))

## Contributing

Contributions are welcome!
