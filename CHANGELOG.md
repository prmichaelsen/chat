### [v.0.0.0] init: Chat with your computer

Initial commit. See [README.md](./README.md).

### [v.0.0.1] bugf: Globs may no longer contain spaces unless properly escaped to avoid glob matcher incorrectly interpreting some queries as globs

`glob` inputs now require spaces be escaped.  

Prior to this change, standard queries that include 
glob characters denoting groups, sections, or ranges,
such as `(` `)`, `{` `}`, or `[` `]`  were 
incorrectly treated as globs.