---
aliases:
  - How to change shell in linux
tags:
  - linux
  - bash
category: til
updated: 2026-08-23T14:27:34+03:00
---
```bash
# To list available shells
cat /etc/shells

# To list current shell
echo $SHELL

# To change shell
chsh --shell /bin/sh username
```