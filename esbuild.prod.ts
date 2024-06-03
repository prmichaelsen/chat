#!/usr/bin/env ts-node-script
import * as esbuild from "esbuild";
import { clean } from "esbuild-plugin-clean";

esbuild.build({
  format: "cjs",
  platform: "node",
  entryPoints: ["./src/index.ts"],
  bundle: true,
  minify: true,
  outfile: "./dist/index.js",
  plugins: [clean({ patterns: ["./dist/*"] })],
});
