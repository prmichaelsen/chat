
## Chat
<span class="badge-npmversion"><a href="https://npmjs.org/package/@prmichaelsen/chat" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@prmichaelsen/chat.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/@prmichaelsen/chat" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/@prmichaelsen/chat.svg" alt="NPM downloads" /></a></span>

Chat with your computer.

```
chat [...OPTIONS] [input]

Provides a CLI interface to have a conversational chat with your computer.

Supports persisting a conversation to disk and resuming it later.

chat understands each input to be a prompt, a command, a redirection, a file
path, directory, or a glob. Please refer to the examples.

Positionals:
  input  Optional initial input                                         [string]

Control Flow:
  -i, --interactive                                                    [boolean]
  -c, --continue     Resume conversation from recovery file (default: true).
                                                                       [boolean]

File System:
  -r, --read           Resume conversation from file.                   [string]
  -w, --write          Stream conversation to file, overwriting contents.
                                                                        [string]
  -a, --append         Stream conversation to file, appending contents. [string]
      --recovery-path  Output conversation recovery path.              [boolean]
      --clean-all      Clean up all recovery files.                    [boolean]
      --clean          Clean up recovery file for current shell.       [boolean]
  -p, --prune          Prune 400 tokens (approximately one page) of the
                       conversation or specify a number of tokens to prune
                       (default: 400).                                  [number]

Options:
      --tokens   Maximum number of tokens to sample. 400 tokens is approximately
                 one page of text. You can also configure tokens by setting the
                 environment variable CHAT_MAX_TOKENS. (default: 200000, max:
                 200000)                                                [number]
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]

Examples:
  chat -i Hi                       Strike up a friendly conversation.
  chat "Explain the singularity"   Prompt once.
  chat --interactive               Start in interactive mode.
  chat -i src/commands/default.ts  Load contents of file into chat.
  chat -i ./src                    Load contents of files in src.
  chat -i "./src/**/*"             Load contents of files matching glob.
  chat --read convo.md Summarize   Summarize existing conversation.
  chat -i -r convo.md -a convo.md  Resume persisted conversation.
  chat -i -ra convo.md             Shorthand for resume conversation.

  --interactive mode
  :ls .                            Execute ls and print output.
  ::ls .                           Execute ls and summarize output.
  > time.md                        Write conversation to file in -i mode.
  >> time.md                       Append conversation to file in -i mode.
  ./src                            Load contents of files in src.
  ./src/**/*                       Load contents of files matching glob.
  Why is the sky blue?             Prompt without quotes.
```

#### Installation

```sh
npm i -g @prmichaelsen/chat
```

#### Initial Setup

`chat` is built on AWS Bedrock Claude Anthropic v2 and it requires CLI authentication with an AWS profile
authorized to call Bedrock in order to work. See the AWS docs on [CLI authentication](https://docs.aws.amazon.com/signin/latest/userguide/command-line-sign-in.html).

```sh
aws sso login --profile my-profile
```
