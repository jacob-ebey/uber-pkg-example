import * as esbuild from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

await Promise.all([
  esbuild.build({
    bundle: true,
    entryPoints: ["./index.mjs"],
    outfile: "./dist/worker.js",
    format: "esm",
    platform: "browser",
    conditions: ["worker"],
  }),
  esbuild.build({
    bundle: true,
    entryPoints: ["./index.mjs"],
    outfile: "./dist/node.mjs",
    format: "esm",
    platform: "node",
    plugins: [nodeExternalsPlugin()],
  }),
  esbuild.build({
    bundle: true,
    entryPoints: ["./index.mjs"],
    outfile: "./dist/bun.mjs",
    format: "esm",
    platform: "node",
    conditions: ["bun"],
    plugins: [nodeExternalsPlugin()],
  }),
]);
