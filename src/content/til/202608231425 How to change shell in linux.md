---
title: "How to Change Shell in Linux"
slug: "how-to-change-shell-in-linux"
created: 2026-08-23T14:25:00+03:00
updated: 2026-08-23T14:27:34+03:00
category: til
tags: ["linux", "bash"]
---
```bash
# To list available shells
cat /etc/shells

# To list current shell
echo $SHELL

# To change shell
chsh --shell /bin/sh username
```