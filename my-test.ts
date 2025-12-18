import { extract } from "npm:@ordis-dev/ordis";

// Define schema inline instead of loading from file
const schema = {
    metadata: {
        name: "Invoice Test"
    },
    fields: {
        invoice_id: { type: "string" as const },
        amount: { type: "number" as const },
        currency: { type: "string" as const },
        date: { type: "string" as const, optional: true }
    }
};

const input = await Deno.readTextFile("./examples/invoice.txt");

const result = await extract({
    input,
    schema,
    llmConfig: {
        baseURL: "https://api.deepseek.com/v1",
        apiKey: "sk-545ac57b36a341ab99362503813e5d90",
        model: "deepseek-chat",
    },
});

console.log(JSON.stringify(result, null, 2));
