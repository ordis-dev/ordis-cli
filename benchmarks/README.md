# Performance Benchmarks

This directory contains performance benchmarks for ordis-cli to measure extraction speed and identify bottlenecks.

## Running Benchmarks

Run all benchmarks:
```bash
npm run benchmark
```

Run a specific benchmark:
```bash
npx tsx benchmarks/schema-validation.bench.ts
```

## Benchmark Files

### model-comparison.bench.ts
Comprehensive benchmark comparing multiple LLM models on accuracy, speed, and quality across 5 test examples of varying difficulty.

**Features:**
- Tests 5 popular local models (llama3.2, qwen2.5, mistral, gemma2, phi3)
- Measures accuracy against expected outputs
- Tracks confidence scores and field-level issues
- Automatically saves detailed reports (JSON + Markdown) in `results/`
- Includes git commit info for tracking improvements over time

**Typical Results:**
- llama3.2:3b: 1.6s avg, 84% accuracy, best balance
- qwen2.5:7b: 6.3s avg, 98% accuracy, most accurate
- mistral:7b: 6.0s avg, 80% accuracy
- gemma2:2b: 1.9s avg, 40% accuracy (struggles with complex)
- phi3:3.8b: 2.9s avg, 0% accuracy (not suitable)

**Reports saved to:** `benchmarks/results/model-comparison-{date}-{time}-{commit}.{json,md}`

### schema-validation.bench.ts
Measures schema validation performance with simple and complex schemas.

**Typical Results:**
- Simple schema: ~1.2M ops/sec
- Complex schema: ~650K ops/sec

### prompt-building.bench.ts
Measures prompt generation performance for different schema complexities and input sizes.

**Typical Results:**
- System prompts: 300K-900K ops/sec
- User prompts: 20M+ ops/sec (string concatenation)

### response-parsing.bench.ts
Measures response validation and JSON parsing performance.

**Typical Results:**
- Valid response: ~1M ops/sec
- Invalid response: ~1.3M ops/sec
- JSON parsing: ~700K ops/sec

### end-to-end.bench.ts
Measures complete extraction pipeline with mocked LLM (isolates pipeline overhead).

**Typical Results:**
- Small input (60 chars): ~2K ops/sec
- Medium input (300 chars): ~10K ops/sec
- Large input (1500 chars): ~6K ops/sec

## Performance Characteristics

### Bottlenecks Identified

1. **LLM API Calls** - By far the slowest component (1-5 seconds typical)
   - Local models: 1-10s depending on model size and hardware
   - Cloud APIs: 200-2000ms depending on provider and model

2. **Schema Validation** - Very fast (<1ms even for complex schemas)
   - Simple schemas: ~0.0008ms
   - Complex schemas: ~0.0014ms

3. **Prompt Building** - Extremely fast (<1ms)
   - System prompts: 0.001-0.003ms
   - User prompts: <0.0001ms

4. **Response Parsing** - Very fast (~1ms)
   - Validation: ~0.0009ms
   - JSON parsing: ~0.0014ms

### Key Insights

- **Pipeline overhead is negligible** (~1-2ms total for non-LLM operations)
- **LLM calls dominate execution time** (99%+ of total time)
- **Input size has minimal impact** on pipeline performance
- **Schema complexity has minor impact** (~2x slower for 10x more fields)

### Optimization Priorities

1. ✅ **LLM Selection** - Choose faster models or providers
2. ✅ **Caching** - Cache schema validations and prompts for repeated use
3. ⚠️ **Parallelization** - Batch multiple extractions (future work)
4. ❌ **Pipeline Optimization** - Not needed (already very fast)

## Baseline Performance (v0.1.0)

Measured on: Node.js v22.20.0, Linux

| Component | Operation | Avg Time | Ops/Sec |
|-----------|-----------|----------|---------|
| Schema Validation | Simple | 0.0008ms | 1.2M |
| Schema Validation | Complex | 0.0014ms | 650K |
| Prompt Building | System (simple) | 0.0011ms | 890K |
| Prompt Building | System (complex) | 0.0032ms | 310K |
| Prompt Building | User | <0.0001ms | 20M+ |
| Response Parsing | Valid | 0.0009ms | 1M |
| Response Parsing | Invalid | 0.0008ms | 1.3M |
| End-to-End | Small input (mocked) | 0.46ms | 2K |
| End-to-End | Medium input (mocked) | 0.09ms | 10K |
| End-to-End | Large input (mocked) | 0.15ms | 6K |

**Note**: End-to-end benchmarks use mocked LLM to isolate pipeline overhead. Real-world extraction with LLM calls will be 100-1000x slower depending on model.

## Adding New Benchmarks

1. Create a new file: `benchmarks/your-feature.bench.ts`
2. Import the benchmark utility or implement your own timing
3. Run with: `npx tsx benchmarks/your-feature.bench.ts`
4. It will automatically be included in `npm run benchmark`

Example:
```typescript
function benchmark(name: string, fn: () => void, iterations: number = 10000) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();
    const total = end - start;
    const avg = total / iterations;
    
    console.log(`${name}:`);
    console.log(`  Total: ${total.toFixed(2)}ms`);
    console.log(`  Average: ${avg.toFixed(4)}ms`);
    console.log(`  Ops/sec: ${(1000 / avg).toFixed(0)}`);
}

benchmark('Your operation', () => {
    // Your code to benchmark
}, 10000);
```
