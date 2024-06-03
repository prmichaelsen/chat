#!/usr/bin/env ts-node-script
import * as esbuild from "esbuild";
import { clean } from "esbuild-plugin-clean";

esbuild.build({
  format: "cjs",
  platform: "node",
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/index.js",
  sourcemap: true,
  plugins: [clean({ patterns: ["./dist/*"] })],
});
