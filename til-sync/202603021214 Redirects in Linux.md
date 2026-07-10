---
tags:
  - linux
  - command-help
aliases:
  - how to redirect outputs in linux
category: til
---
....In Bash and other Linux shells, every running program uses three standard I/O streams. Each stream is represented by a numeric file descriptor:

- `0` — `stdin`, the standard input stream.
- `1` — `stdout`, the standard output stream.
- `2` — `stderr`, the standard error stream.

Streams can be redirected using the `n>` operator, where `n` is the file descriptor number. When `n` is omitted, it defaults to `1` (standard output).

```bash

# Standard
command 1> file.txt

# Std err
command 2> error.txt


## To redirect to diff files
command 1> output.txt 2> error.txt

## Both
command 1 &> output.txt

```

## Reference

[How to Redirect stderr to stdout in Bash | Linuxize](https://linuxize.com/post/bash-redirect-stderr-stdout/)