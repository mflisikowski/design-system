import { context } from "esbuild";

const watch = process.argv.includes("--watch");
const buildContext = await context({
  bundle: true,
  entryPoints: ["src/code.ts"],
  format: "iife",
  legalComments: "none",
  outfile: "dist/code.js",
  platform: "browser",
  target: "es2022",
});

if (watch) {
  await buildContext.watch();
  process.stdout.write("Watching MFD Token Sync sources.\n");
} else {
  await buildContext.rebuild();
  await buildContext.dispose();
}
