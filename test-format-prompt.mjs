import { loadSchema } from "./src/schemas/loader.js";
import { buildSystemPrompt } from "./src/llm/prompt-builder.js";

const schema = await loadSchema("./examples/format-test.schema.json");
const prompt = buildSystemPrompt(schema);

console.log("=== SYSTEM PROMPT ===");
console.log(prompt);
console.log("\n=== FORMAT CHECK ===");
console.log("Contains 'format: date-time':", prompt.includes("[format: date-time]"));
console.log("Contains 'format: email':", prompt.includes("[format: email]"));
console.log("Contains 'format: uri':", prompt.includes("[format: uri]"));
