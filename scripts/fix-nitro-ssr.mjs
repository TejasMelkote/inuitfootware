import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOTS = [
  join(process.cwd(), ".vercel/output/functions"),
  join(process.cwd(), ".output/server"),
];

async function walk(dir, files = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path, files);
    else if (entry.name.endsWith(".mjs") || entry.name.endsWith(".js")) files.push(path);
  }
  return files;
}

function patchSsrExports(source) {
  if (!source.includes("ssr_exports as")) return source;
  const exportMatch = source.match(/export\s*\{[^}]*ssr_exports as[^}]*\}/);
  if (!exportMatch) return source;
  const defaultBind = exportMatch[0].match(/([A-Za-z_$][\w$]*)\s+as\s+default/);
  const replacement = defaultBind ? `${defaultBind[1]} as` : "server_default as";
  return source.replace(/ssr_exports as/g, replacement);
}

function ensureDefaultExport(source) {
  if (!source.includes("var server_default = createServerEntry")) return source;
  if (/export\s*\{[^}]*as\s+default/.test(source)) return source;
  return source.replace(
    /export\s*\{([^}]+)\}/,
    (_match, inner) => `export { server_default as default, ${inner.trim()} }`,
  );
}

function retargetViteEnv(source, ssr2Rel) {
  if (!source.includes("__nitro_vite_envs__")) return source;
  return source.replace(
    /import\("\.\/_ssr\/ssr\.mjs"\)\.then\(\(n\) => n\.\w+\)/g,
    `import("${ssr2Rel}")`,
  );
}

const files = [];
for (const root of ROOTS) files.push(...(await walk(root)));

const ssr2 = files.find(
  (file) => file.includes("/_ssr/") && file.endsWith("ssr2.mjs"),
);
const ssr2Rel = "./_ssr/ssr2.mjs";

let patched = 0;
for (const file of files) {
  const original = await readFile(file, "utf8");
  let next = patchSsrExports(original);
  next = ensureDefaultExport(next);
  if (ssr2) next = retargetViteEnv(next, ssr2Rel);
  if (next !== original) {
    await writeFile(file, next);
    patched += 1;
    console.log(`patched ${file}`);
  }
}

if (patched === 0) console.log("No Nitro SSR patches needed.");
else console.log(`Patched ${patched} file(s).`);
