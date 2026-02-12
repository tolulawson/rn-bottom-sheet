#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const sourcesPath = 'docs/sources.yaml';
const indexPath = 'docs/knowledge-index.md';

const raw = readFileSync(sourcesPath, 'utf8');
const parsed = JSON.parse(raw);
const sources = parsed.sources ?? [];

const header = [
  '# Knowledge Index',
  '',
  'Generated from `docs/sources.yaml`.',
  '',
  '| ID | Name | Version Pin | Retrieved | Why It Matters | Local Doc | Source |',
  '| --- | --- | --- | --- | --- | --- | --- |',
];

const whyById = {
  'nitro-view-components': 'Nitro lifecycle, threading, callback and recycle behavior for host views.',
  'apple-uikit-sheet': 'Primary native engine API semantics for detents, dimming, and transitions.',
  'apple-swiftui-sheet-item': 'SwiftUI sheet semantics relevant to API naming and behavior expectations.',
  'apple-swiftui-presentation-detents': 'Detent behavior and selection semantics at SwiftUI layer.',
  'react-navigation-native-stack': 'Form sheet options and caveats used for adapter design.',
  'react-navigation-nesting': 'Action bubbling behavior for in-sheet nested navigation.',
  'reanimated-create-animated-component': 'Animated wrapper contract for custom host components.',
  'reanimated-use-animated-props': 'Animated prop and adapter constraints for interop.',
};

const rows = sources.map((s) => {
  const why = whyById[s.id] ?? 'Project reference.';
  return `| ${s.id} | ${s.name} | ${s.version_pin} | ${s.retrieved_at} | ${why} | \`${s.local_doc_path}\` | [link](${s.url}) |`;
});

const output = [...header, ...rows, ''].join('\n');
writeFileSync(indexPath, output);
console.log(`Wrote ${indexPath} (${sources.length} sources)`);
