import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const extensions = new Set([".css", ".js", ".jsx", ".scss", ".ts", ".tsx"]);
const primitivePalette =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const namedColor =
  "aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen";
const colorProperty =
  "background(?:-color)?|backgroundColor|border(?:-[a-z-]+)?|borderColor|box-shadow|boxShadow|color|fill|outline(?:-color)?|outlineColor|stroke|text-shadow|textShadow";
const forbiddenPatterns = [
  new RegExp(
    `\\b(?:bg|text|border|outline|ring|fill|stroke)-(?:${primitivePalette})-(?:[1-9]\\d{1,2})\\b`,
    "g",
  ),
  /\b(?:bg|text|border|outline|ring|fill|stroke)-(?:black|white)\b/g,
  /#[0-9a-f]{3,8}\b/gi,
  /\b(?:color|color-mix|device-cmyk|hsl|hwb|lab|lch|light-dark|oklab|oklch|rgb)a?\(/gi,
  new RegExp(`\\b(?:${colorProperty})\\s*:\\s*[^;\\n}]*(?:${namedColor})\\b`, "gi"),
  /--mfd-reference-color-[a-z0-9-]+/g,
];

async function filesAt(target) {
  let metadata;
  try {
    metadata = await stat(target);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  if (metadata.isFile()) {
    return extensions.has(path.extname(target)) ? [target] : [];
  }

  const files = [];
  for (const entry of await readdir(target, { withFileTypes: true })) {
    if (entry.name === "dist" || entry.name === "node_modules" || entry.name.startsWith(".")) {
      continue;
    }
    files.push(...(await filesAt(path.join(target, entry.name))));
  }
  return files;
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("Provide at least one component source path to validate.");
  process.exit(2);
}

const violations = [];
for (const target of targets) {
  for (const file of await filesAt(path.resolve(target))) {
    const source = await readFile(file, "utf8");
    for (const pattern of forbiddenPatterns) {
      for (const match of source.matchAll(pattern)) {
        const line = source.slice(0, match.index).split("\n").length;
        violations.push(`${path.relative(process.cwd(), file)}:${line}: ${match[0]}`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Primitive color usage is forbidden in component sources:");
  for (const violation of violations.sort()) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Component color usage check passed.");
