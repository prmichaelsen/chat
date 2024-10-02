import { interpretInput } from "./interpretInput";
import * as fs from "node:fs";

describe("interpretInput", () => {
  beforeAll(() => {
    fs.writeFileSync("./test.txt", "test");
  });
  afterAll(() => {
    fs.unlinkSync("./test.txt");
  });
  it.each([[
      undefined,
      "none"
    ], [
      "",
      "none"
    ], [
      "   ",
      "none"
    ], [
      ":help",
      "help"
    ], [
      ": help",
      "help"
    ], [
      ":clear",
      "clear"
    ], [
      ": clear",
      "clear"
    ], [
      ":exit",
      "exit"
    ], [
      ": exit",
      "exit"
    ], [
      "::",
      "::"
    ], [
      ":",
      ":"
    ], [
      ">>",
      ">>"
    ], [
      ">",
      ">"
    ], [
      "Human:",
      "conversation"
    ], [
      "Assistant:",
      "conversation"
    ], [
      ".",
      "directory"
    ], [
      "./test.txt",
      "file"
    ], [
      "https://web.com",
      "url"
    ], [
      "file://text.ts",
      "url"
    ], [
      "./*.txt",
      "glob"
    ], [
      "./**/test.txt",
      "glob"
    ], [
      "./**/*.txt",
      "glob"
    ], [
      "./src/**/*.*",
      "glob"
    ], [
      "/**/*.ts",
      "glob"
    ], [
      "../**/*.ts",
      "glob"
    ], [
      "c:\\windows.txt",
      "glob"
    ], [
      "C:\\windows.txt",
      "glob"
    ], [
      "\\windows.txt",
      "glob"
    ], [
      "1 + 1",
      "query"
  ]])(
    "'%s' returns %s",
    (input: string | undefined, expected: string) => expect(interpretInput(input)).toEqual(expected)
  );
});