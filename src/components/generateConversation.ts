import * as fs from "node:fs";
import * as https from "node:https";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { globSync } from "glob";
import { interpretInput } from "./interpretInput";
import { log } from "../extern/log";

export const generateConversation = async (input: string = "") => {
  let conversation: string = "";
  const inputType = interpretInput(input);
  switch (inputType) {
    // If this is a new query
    case "query": {
      conversation += "Human: " + "\n" + "\n" + input + "\n";
      break;
    }

    // If we are loading an existing conversation
    case "conversation": {
      conversation += input;
      break;
    }

    case "file": {
      const fp = input;
      const contents = fs.readFileSync(fp, "utf-8");
      const contentsType = interpretInput(contents);
      switch (contentsType) {
        case "conversation":
        case "none":
          conversation += await generateConversation(contents);
          break;
        default:
          const ext = path.extname(fp).replace(/^\./, "");
          const prompt = `
Human: 

${fp}
${"```"}${ext}
${contents}
${"```"}
          `.trim();
          conversation += prompt + "\n";
      }
      break;
    }

    case "directory": {
      const dir = input;
      const files = fs.readdirSync(dir).map((fp) => path.join(dir, fp));
      for (const file of files) {
        if (fs.statSync(file).isFile()) {
          conversation += await generateConversation(file);
        }
      }
      break;
    }

    case "glob": {
      const files = globSync(input);
      for (const file of files) {
        conversation += await generateConversation(file);
      }
      break;
    }

    case "url": {
      const result = await new Promise<string>((resolve, reject) => {
        https
          .get(input, (res) => {
            let data = "";
            res.on("data", (chunk) => {
              data += chunk;
            });
            res.on("end", () => {
              resolve(data);
            });
          })
          .on("error", reject);
      });
      const prompt = `
Human: 

${input}
${"```"}html
${result}
${"```"}
          `.trim();
      conversation += prompt + "\n";
      break;
    }

    case ">": {
      conversation += input.substring(1).trim();
      break;
    }
    case ">>": {
      conversation += input.substring(2).trim();
      break;
    }

    case "exit":
    case "clear": {
      break;
    }

    case ":": {
      const cmd = input.substring(1);
      try {
        const out = execSync(cmd, { encoding: "utf-8", env: process.env });
        conversation += out;
      } catch (e) {
        log.error("[chat]: Execute command failed.", e);
      }
      break;
    }

    case "::": {
      const cmd = input.substring(2);
      try {
        const out = execSync(cmd, { encoding: "utf-8", env: process.env });
        const prompt = `
Human: 

${"```"}sh
${cmd}
${"```"}

---

Assistant:

${"```"}
${out}
${"```"}
        `.trim();
        conversation += prompt + "\n";
      } catch (e) {
        log.error("[chat]: Execute command failed.", e);
      }
      break;
    }

    case "none": {
      break;
    }

    default:
      const _exhaustiveCheck: never = inputType;
  }

  return conversation;
};
