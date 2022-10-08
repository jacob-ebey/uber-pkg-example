import * as fs from "fs";
import * as path from "path";
import * as esbuild from "esbuild";

let cwd = process.cwd();
let pkgPath = path.resolve(cwd, "package.json");

let pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
let source = pkg.source;

let external = Object.keys(pkg.dependencies || {})
  .concat(Object.keys(pkg.peerDependencies || {}))
  .concat(Object.keys(pkg.optionalPeerDependencies || {}))
  .concat(Object.keys(pkg.imports || {}));

console.log(source);

let baseName = path.basename(source, path.extname(source));

await Promise.all([
  esbuild.build({
    entryPoints: {
      [baseName]: source,
    },
    outfile: path.resolve(cwd, "dist", `${baseName}.mjs`),
    format: "esm",
    target: "es2019",
    bundle: true,
    external,
  }),
  esbuild.build({
    entryPoints: {
      [baseName]: source,
    },
    outfile: path.resolve(cwd, "dist", `${baseName}.cjs`),
    format: "cjs",
    target: "node16",
    bundle: true,
    external,
  }),
]);
