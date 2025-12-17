# Confidence Scoring Design

## Overview

Confidence scoring is a core design principle in Ordis that allows users to define acceptable levels of certainty for LLM-based data extraction. Rather than accepting any extraction result, users can specify confidence thresholds to ensure data quality meets their requirements.

## Core Principle

**Treat LLM output as probabilistic, not deterministic.**

When an LLM extracts data from unstructured text, it's making educated guesses. Confidence scoring makes this uncertainty explicit and gives users control over what level of certainty is acceptable for their use case.

## How It Works

### 1. Schema-Level Configuration

Define confidence requirements in your schema:

```json
{
  "fields": {
    "invoice_id": { "type": "string" },
    "amount": { "type": "number" }
  },
  "confidence": {
    "threshold": 80,
    "failOnLowConfidence": true
  }
}
```

**Parameters:**

- `threshold` (0-100): Minimum confidence score required for successful extraction
- `failOnLowConfidence` (boolean): Whether to fail the extraction if below threshold

### 2. Per-Field Confidence

Each extracted field receives its own confidence score:

```json
{
  "confidenceByField": {
    "invoice_id": 95,
    "amount": 85,
    "date": 70
  }
}
```

This granular tracking allows you to:

- Identify which fields the LLM is uncertain about
- Make informed decisions about partial data
- Flag fields for manual review

### 3. Overall Confidence Score

An aggregated confidence score across all fields:

```json
{
  "confidence": 83.3,
  "meetsThreshold": true
}
```

The overall score can be calculated as:

- **Average**: Mean of all field confidence scores
- **Minimum**: Lowest field confidence (most conservative)
- **Weighted**: Based on field importance (future enhancement)

## Use Cases by Threshold

### High Confidence (95-99%)

**Use Case:** Critical financial data, legal documents, compliance records

**Behavior:** Very strict - only accept near-certain extractions

```json
{
  "confidence": {
    "threshold": 95,
    "failOnLowConfidence": true
  }
}
```

**Result:** Most extractions will fail, requiring manual review. Best for high-stakes scenarios where errors are costly.

### Standard Confidence (80-94%)

**Use Case:** General business documents, invoices, receipts, forms

**Behavior:** Balanced - accept high-quality extractions, reject uncertain ones

```json
{
  "confidence": {
    "threshold": 85,
    "failOnLowConfidence": true
  }
}
```

**Result:** Good balance between automation and accuracy. Suitable for most production use cases.

### Moderate Confidence (60-79%)

**Use Case:** Content tagging, initial data gathering, exploratory extraction

**Behavior:** Permissive - accept reasonable attempts, useful for bulk processing

```json
{
  "confidence": {
    "threshold": 70,
    "failOnLowConfidence": true
  }
}
```

**Result:** Higher throughput with potential for some errors. Good for non-critical data or when human review follows.

### Warning Mode (Any threshold + failOnLowConfidence: false)

**Use Case:** Development, testing, partial data acceptance

**Behavior:** Process all extractions but flag low confidence

```json
{
  "confidence": {
    "threshold": 80,
    "failOnLowConfidence": false
  }
}
```

**Result:** Extraction succeeds but includes confidence warnings. Allows downstream systems to decide how to handle uncertain data.

## Extraction Result Structure

```typescript
{
  "success": true,              // Overall success (validation + confidence)
  "data": {                     // Extracted data (only if success: true)
    "invoice_id": "INV-001",
    "amount": 1250.00
  },
  "confidence": 87.5,           // Overall confidence score
  "confidenceByField": {        // Per-field confidence
    "invoice_id": 95,
    "amount": 80
  },
  "meetsThreshold": true,       // Does confidence meet schema requirement?
  "errors": []                  // Validation errors or confidence warnings
}
```

## Decision Flow

```
LLM Extraction
    ↓
Schema Validation (types, constraints)
    ↓
  Valid? ──No──> success: false, errors: [validation errors]
    ↓ Yes
Confidence Check
    ↓
confidence >= threshold?
    ↓
  Yes ──> success: true, data: {...}
    ↓ No
failOnLowConfidence?
    ↓
  Yes ──> success: false, errors: [confidence too low]
  No  ──> success: true, data: {...}, warnings: [low confidence]
```

## Implementation Guidelines

### For Schema Authors

1. **Choose appropriate thresholds** based on data criticality
2. **Start strict (85%+)** and relax if needed
3. **Monitor field-level confidence** to identify problematic fields
4. **Use failOnLowConfidence: false** during development/testing

### For LLM Integration

1. **Always return confidence scores** (0-100) for each field
2. **Be honest about uncertainty** - don't inflate scores
3. **Per-field granularity** is better than overall only
4. **Include reasoning** in metadata when confidence is low

### For Application Developers

1. **Respect meetsThreshold flag** in automated workflows
2. **Log confidence scores** for monitoring and improvement
3. **Route low-confidence extractions** to manual review queues
4. **Track confidence trends** to tune thresholds over time

## Philosophy

**"Good enough" is relative to context.**

A 75% confident extraction might be:

- ✅ Perfect for tagging internal documents
- ❌ Unacceptable for processing invoices
- ⚠️ Useful with manual review for legal contracts

By making confidence explicit and configurable, Ordis puts users in control of the quality-throughput tradeoff rather than making that decision for them.

## Future Enhancements

- **Per-field thresholds**: Different confidence requirements for different fields
- **Weighted confidence**: Important fields contribute more to overall score
- **Confidence calibration**: Adjust scores based on historical accuracy
- **Confidence explanations**: Why the LLM assigned a particular score
- **Adaptive thresholds**: Learn optimal thresholds from user feedback
