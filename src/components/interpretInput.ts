import fs from "fs";
import { isGlob } from "../extern/isGlob";

export const interpretInput = (input: string = "") => {
  let _input = input.trim();
  if (_input === "") {
    return "none";
  }

  if (_input === ":help" || _input === ": help") {
    return "help";
  }

  if (_input === ":clear" || _input === ": clear") {
    return "clear";
  }

  if (_input === ":exit" || _input === ": exit") {
    return "exit";
  }

  if (_input.startsWith("::")) {
    return "::";
  }

  if (_input.startsWith(":")) {
    return ":";
  }

  if (_input.startsWith(">>")) {
    return ">>";
  }

  if (_input.startsWith(">")) {
    return ">";
  }

  if (_input.startsWith("Human:") || _input.startsWith("Assistant:")) {
    return "conversation";
  }

  try {
    if (fs.statSync(_input).isDirectory()) {
      return "directory";
    }

    if (fs.statSync(_input).isFile()) {
      return "file";
    }
  } catch (e) {}

  if (isGlob(_input)) {
    return "glob";
  }

  try {
    new URL(_input);
    return "url";
  } catch (e) {}

  return "query";
};
