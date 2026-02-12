#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

const sourcesPath = 'docs/sources.yaml';
if (!existsSync(sourcesPath)) {
  fail('docs/sources.yaml is missing');
  process.exit(1);
}

let sources;
try {
  const parsed = JSON.parse(readFileSync(sourcesPath, 'utf8'));
  sources = parsed.sources;
} catch (error) {
  fail(`docs/sources.yaml is not valid JSON-compatible YAML: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(sources) || sources.length === 0) {
  fail('docs/sources.yaml must contain a non-empty "sources" array');
}

const requiredFields = ['id', 'name', 'url', 'retrieved_at', 'version_pin', 'license_notes', 'local_doc_path'];
for (const source of sources ?? []) {
  for (const field of requiredFields) {
    if (!source[field]) {
      fail(`Source "${source.id ?? 'unknown'}" missing field: ${field}`);
    }
  }
  if (source.local_doc_path && !existsSync(source.local_doc_path)) {
    fail(`Local doc path does not exist: ${source.local_doc_path}`);
  }
}

if (!existsSync('docs/implementation-plan-v1.md')) {
  fail('docs/implementation-plan-v1.md is missing');
}
if (!existsSync('tasks/todo.md')) {
  fail('tasks/todo.md is missing');
}
if (!existsSync('tasks/lessons.md')) {
  fail('tasks/lessons.md is missing');
}

const adrFiles = ['docs/adr/ADR-0001-ios-sheet-engine.md', 'docs/adr/ADR-0002-content-hosting-model.md', 'docs/adr/ADR-0003-navigation-adapter-boundary.md'];
for (const file of adrFiles) {
  if (!existsSync(file)) {
    fail(`Missing ADR file: ${file}`);
  }
}

if (!existsSync('docs/knowledge-index.md')) {
  fail('docs/knowledge-index.md is missing (run yarn docs:sync)');
} else {
  const index = readFileSync('docs/knowledge-index.md', 'utf8');
  for (const source of sources ?? []) {
    if (!index.includes(source.id)) {
      fail(`docs/knowledge-index.md missing source id row: ${source.id}`);
    }
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('Knowledge base check passed');
