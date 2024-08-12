### [v.0.0.0] init: Chat with your computer

Initial commit. See [README.md](./README.md).

### [v.0.0.1] bugf: Globs may no longer contain spaces unless properly escaped to avoid glob matcher incorrectly interpreting some queries as globs

`glob` inputs now require spaces be escaped.  

Prior to this change, standard queries that include 
glob characters denoting groups, sections, or ranges,
such as `(` `)`, `{` `}`, or `[` `]`  were 
incorrectly treated as globs.

### [v.0.0.2] feat: interactive mode help text, better glob checking

`:help` now displays help text while in interactive mode.

Tests added for `interpretInput`.

`isGlob` util function for better glob checking.

`intepretInput` now treats input as glob only if it starts with 
`.`, `..`, `/`, `\` or a Windows root drive.