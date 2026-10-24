---
title: "How to Use Environment Variables in Python .venv in Vscode"
slug: "how-to-use-environment-variables-in-python-venv-in-vscode"
created: 2026-05-12T14:10:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["python", "venv"]
---
1. Create a `.env`  file in the workspace root (same place where .vscode file is)
2. Press Ctrl+Shif+P > Open user settings json
3. Add the following settings

```json
"python.envFile": "${workspaceFolder}/.env",
"python.terminal.useEnvFile": true
```