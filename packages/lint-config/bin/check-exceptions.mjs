#!/usr/bin/env node

import path from "node:path";

import { checkExceptionRepository } from "../src/exceptions.mjs";

const root = path.resolve(process.argv[2] ?? process.cwd());
const result = await checkExceptionRepository(root);

for (const entry of result.diagnostics) {
  console.error(`${entry.file}:${entry.line}: error mfd(lint-exception): ${entry.message}`);
}

if (result.diagnostics.length > 0) {
  process.exitCode = 1;
} else {
  console.log(`MFD lint exceptions: ${result.total} reviewed.`);
}
