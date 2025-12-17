#!/usr/bin/env node

/**
 * Benchmark Runner
 * Runs all benchmarks and displays results
 */

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';

const benchmarksDir = join(process.cwd(), 'benchmarks');
const benchmarkFiles = readdirSync(benchmarksDir)
    .filter(file => file.endsWith('.bench.ts'))
    .sort();

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║         Ordis Performance Benchmarks                 ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

for (const file of benchmarkFiles) {
    const benchmarkPath = join(benchmarksDir, file);
    
    try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Running: ${file}`);
        console.log('='.repeat(60) + '\n');
        
        execSync(`npx tsx ${benchmarkPath}`, { stdio: 'inherit' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\n❌ Error running ${file}:`, message);
    }
}

console.log('\n' + '='.repeat(60));
console.log('All benchmarks completed');
console.log('='.repeat(60) + '\n');
