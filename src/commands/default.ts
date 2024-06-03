import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as readline from "node:readline";
import { Fd, stdio } from "../extern/stdio";
import { chatService } from "../components/chatService";
import { cli } from "../cli";
import { generatePrompt } from "../components/generatePrompt";
import { interpretInput } from "../components/interpretInput";
import { log } from "../extern/log";
import { silenceConsoleLog } from "../init/silenceConsoleLog";

const Group = {
  fs: "File System:",
  ctrl: "Control Flow:",
};

cli
  .usage(
    "\n" +
      `chat [...OPTIONS] [input]

      Provides a CLI interface to have a conversational chat with your computer.

      Supports persisting a conversation to disk and resuming it later.

      chat understands each input to be a prompt, a command, a redirection, a file path, directory, or a glob. Please refer to the examples.
      `.trim()
  )
  .example(`chat -i Hi`, "Strike up a friendly conversation.")
  .example(`chat "Explain the singularity"`, "Prompt once.")
  .example(`chat --interactive`, "Start in interactive mode.")
  .example(
    `chat -i src/commands/default.ts`,
    "Load contents of file into chat."
  )
  .example(`chat -i src`, "Load contents of files in src.")
  .example(`chat -i "src/**/*"`, "Load contents of files matching glob.")
  .example(`chat --read convo.md Summarize`, "Summarize existing conversation.")
  .example(`chat -i -r convo.md -a convo.md`, "Resume persisted conversation.")
  .example(`chat -i -ra convo.md`, "Shorthand for resume conversation.")
  .example("", "")
  .example("--interactive mode", "")
  .example(`:ls .`, "Execute ls and print output.")
  .example(`::ls .`, "Execute ls and summarize output.")
  .example(`> time.md`, "Write conversation to file in -i mode.")
  .example(`>> time.md`, "Append conversation to file in -i mode.")
  .example(`src`, "Load contents of files in src.")
  .example(`src/**/*`, "Load contents of files matching glob.")
  .example(`Why is the sky blue?`, "Prompt without quotes.")
  .command<{
    input?: string;
    interactive?: boolean;
    continue?: boolean;
    read?: string;
    write?: string;
    append?: string;
    clean?: boolean;
    recover?: boolean;
  }>(
    "$0 [input]",
    "",
    (yargs) => {
      yargs.positional("input", {
        type: "string",
        desc: "",
        description: "Optional initial input",
      });
      yargs.option("interactive", {
        group: Group.ctrl,
        alias: "i",
        type: "boolean",
        boolean: true,
      });
      yargs.option("continue", {
        group: Group.ctrl,
        alias: "c",
        type: "boolean",
        boolean: true,
        conflicts: ["read"],
      });
      yargs.option("read", {
        group: Group.fs,
        alias: "r",
        type: "string",
        description: "Resume conversation from file.",
      });
      yargs.option("write", {
        group: Group.fs,
        alias: "w",
        type: "string",
        description: "Stream conversation to file, overwriting contents.",
        conflicts: ["append"],
      });
      yargs.option("append", {
        group: Group.fs,
        alias: "a",
        type: "string",
        description: "Stream conversation to file, appending contents.",
        conflicts: ["write"],
      });
      yargs.option("recovery-path", {
        group: Group.fs,
        type: "boolean",
        boolean: true,
        description: "Output conversation recovery path.",
        conflicts: [
          "read",
          "write",
          "append",
          "input",
          "interactive",
          "continue",
          "clear",
          "clear-all",
        ],
      });
      yargs.option("clean-all", {
        group: Group.fs,
        type: "boolean",
        boolean: true,
        description: "Clean up all recovery files.",
        conflicts: [
          "input",
          "interactive",
          "continue",
          "read",
          "write",
          "append",
          "clean",
          "recovery-path",
        ],
      });
      yargs.option("clean", {
        group: Group.fs,
        type: "boolean",
        boolean: true,
        description: "Clean up recovery file for current shell.",
        conflicts: [
          "input",
          "interactive",
          "continue",
          "read",
          "write",
          "append",
          "clean-all",
          "recovery-path",
        ],
      });
    },
    async (argv) => {
      const uid = process.ppid.toString();
      const tmpDir = path.join(os.tmpdir(), "chat");
      const tmpUDir = path.join(tmpDir, uid);
      const convoFp = path.join(tmpUDir, "convo.md");

      silenceConsoleLog();

      const {
        input,
        interactive = false,
        read,
        continue: cont = read === undefined,
        write,
        append,
        cleanAll = false,
        clean = false,
        recoveryPath = false,
      } = argv;

      if (recoveryPath) {
        log.print(convoFp);
        return;
      }

      if (cleanAll) {
        if (!fs.existsSync(tmpDir)) {
          log.print(`Nothing to clean.`);
          return;
        }
        try {
          const numFiles = fs.readdirSync(tmpDir).length;
          fs.rmSync(tmpDir, { recursive: true });
          log.print(`Deleted ${numFiles} files.`);
        } catch (e) {
          log.error(e);
        }
        return;
      }

      if (clean) {
        if (!fs.existsSync(tmpUDir)) {
          log.print(`Nothing to clear.`);
          return;
        }
        try {
          const numFiles = fs.readdirSync(tmpUDir).length;
          fs.rmSync(tmpUDir, { recursive: true });
          log.print(`Deleted ${numFiles} files.`);
        } catch (e) {
          log.error(e);
        }
        return;
      }

      let conversation = "";

      // Build output stream fpishs
      const outputs: string[] = [];
      const afpish = `mode:a/${append || read}`;
      const wfpish = `mode:w/${write || read}`;
      if (append !== undefined) {
        outputs.push(afpish);
      } else if (write !== undefined) {
        outputs.push(wfpish);
      }
      const convoMode = cont ? "a" : "w";
      const convoFpish = `mode:${convoMode}+/${convoFp}`;
      outputs.push(convoFpish);
      const recentConvoFp = path.join(tmpUDir, "recentConvo.md");
      const recentConvoFpish = `mode:${convoMode}+/${recentConvoFp}`;
      outputs.push(recentConvoFpish);

      if (cont && fs.existsSync(convoFp)) {
        conversation += await generatePrompt(convoFp);
      } else if (read !== undefined) {
        conversation += await generatePrompt(read || append || write);
      }

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const exit = (code: number = 0) => {
        rl.close();
        stdio.close(outputs);
        stdio.unlink([recentConvoFpish]);
        process.exit(code);
      };

      rl.on("SIGINT", exit);

      const inputs: string[] = [];
      if (input) {
        inputs.push(input);
      }

      if (inputs.length === 0) {
        if (interactive) {
          await stdio.print([Fd.stdout], "Human: ");
          await stdio.print([Fd.stdout]);
        }
        inputs.push(
          await new Promise<string>((resolve) => rl.question("", resolve))
        );
      }

      try {
        do {
          const currentInput = inputs.shift()!;

          let response = "";
          let prompt = await generatePrompt(currentInput);

          const promptType = interpretInput(currentInput);
          switch (promptType) {
            case "url":
            case "file": {
              const fp = currentInput;
              const contents = prompt;
              conversation += "\n" + contents;
              response = `Assistant: Successfully read the contents of file ${fp}\n`;
              break;
            }
            case "directory": {
              const dir = currentInput;
              const contents = prompt;
              conversation += "\n" + contents;
              response = `Assistant: Successfully read the contents of directory ${dir}\n`;
              break;
            }
            case "glob": {
              const glob = currentInput;
              const contents = prompt;
              conversation += "\n" + contents;
              response = `Assistant: Successfully read all files matching ${glob}\n`;
              break;
            }
            // Execute command and summarize output
            case "::": {
              conversation +=
                "\n" +
                prompt +
                "\n" +
                "Human: Give concise highlights about key values of output in less than 30 words." +
                "\n";
              conversation += "Assistant: ";
              const completion = await chatService({
                prompt: conversation,
              });
              response = "Assistant: " + completion + "\n";
              conversation += "\n" + response;
              break;
            }
            // Execute command and print raw output
            case ":": {
              response = `
Assistant:

${"```"}
${prompt}
${"```"}
            `.trim();
              const cmd = currentInput.slice(1);
              prompt = `
  Human: 

${"```"}
${cmd}
${"```"}`.trim();
              conversation += "\n" + prompt;
              conversation += "\n" + response;
              break;
            }
            case ">": {
              const wfp = prompt;
              if (!wfp) {
                response =
                  "Usage: > <file> - Save entire conversation to file.\n";
                break;
              }
              const wfpish = `mode:w/${wfp}`;
              stdio.pipe([convoFpish], [wfpish]);
              response =
                "Assistant: Saved entire conversation to " + wfp + "\n";
              break;
            }
            case ">>": {
              const afp = prompt;
              if (!afp) {
                response =
                  "Usage: >> <file> - Flush recent messages to file.\n";
                break;
              }
              const afpish = `mode:a/${afp}`;
              stdio.pipe([recentConvoFpish], [afpish], {
                onEnd: (fpish) => stdio.clear([fpish]),
              });
              response = `Assistant: Flushed recent messages to ` + afp + "\n";
              break;
            }
            case "clear": {
              stdio.clear([convoFpish, recentConvoFpish]);
              break;
            }
            case "exit": {
              exit();
              break;
            }
            case "none": {
              break;
            }
            case "conversation": {
              conversation += prompt;
              break;
            }
            case "query":
            default: {
              conversation += "\n" + prompt;
              conversation += "Assistant: ";
              const completion = await chatService({
                prompt: conversation,
              });
              response = "Assistant: " + "\n" + "\n" + completion + "\n";
              conversation += "\n" + response;
              const _exhaustiveCheck: "query" = promptType;
              break;
            }
          }

          if (response) {
            await stdio.print([...outputs], prompt);
            await stdio.print([Fd.stdout]);
            await stdio.print([Fd.stdout, ...outputs], "---");
            await stdio.print([Fd.stdout, ...outputs]);

            await stdio.print([Fd.stdout, ...outputs], response);
            // Sometimes the completion starts adding ---
            // on its own, so we don't need to print
            // it again.
            if (!response.trim().endsWith("---")) {
              await stdio.print([Fd.stdout, ...outputs], "---");
              await stdio.print([Fd.stdout, ...outputs]);
            }
          }

          if (interactive) {
            await stdio.print([Fd.stdout], "Human: ");
            await stdio.print([Fd.stdout]);
            inputs.push(
              await new Promise<string>((resolve) => rl.question("", resolve))
            );
          }
        } while (inputs.length > 0);
      } catch (e) {
        log.error(e);
      } finally {
        exit(1);
      }
    }
  );
