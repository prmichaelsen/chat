// imported this way to satisfy esbuild
import Yargs from "yargs";
const yargs: Yargs.Argv = require("yargs");

export const cli = yargs.help();
