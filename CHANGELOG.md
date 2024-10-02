### [v.0.0.0]
#### [v.0.0.0] init: Chat with your computer

Initial commit. See [README.md](./README.md).

#### [v.0.0.1] bugf: Globs may no longer contain spaces unless properly escaped to avoid glob matcher incorrectly interpreting some queries as globs

`glob` inputs now require spaces be escaped.  

Prior to this change, standard queries that include 
glob characters denoting groups, sections, or ranges,
such as `(` `)`, `{` `}`, or `[` `]`  were 
incorrectly treated as globs.

#### [v.0.0.2] feat: interactive mode help text, better glob checking

`:help` now displays help text while in interactive mode.

Tests added for `interpretInput`.

`isGlob` util function for better glob checking.

`intepretInput` now treats input as glob only if it starts with 
`.`, `..`, `/`, `\` or a Windows root drive.

#### [v.0.0.3] feat: Enable configuring CHAT_MAX_TOKENS

Use `--tokens` or set the environment variable `CHAT_MAX_TOKENS`
to configure the max sample tokens. Max tokens can be a value
greater than zero or up to and including 200,000.

400 tokens is equivalent to about one page of text. Max tokens
is equivalent to about 500 pages of text.

https://support.anthropic.com/en/articles/7996856-what-is-the-maximum-prompt-length

#### [v.0.0.4] feat: Enable pruning conversations

Use `--prune` to prune 400 tokens or `--prune n` to prune `n` tokens 
from the conversation.

If no conversation file is specified with `--read` then 
the recovery conversation will be pruned.

### [v1.0.0]
#### [v.1.0.0] feat: Initial release

#### [v.1.0.1] build: npm publish lifecycle improvements
* `publish` fails if git index is dirty
* `prepublishOnly` cleans dist and node_modules and performs a fresh install of dependencies

#### [v.1.0.2] docs: npm badges