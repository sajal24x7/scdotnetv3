---
tags:
  - python
  - venv
aliases:
category: til
updated: 2026-08-25T14:30:56
---
1. Create a `.env`  file in the workspace root (same place where .vscode file is)
2. Press Ctrl+Shif+P > Open user settings json
3. Add the following settings

```json
"python.envFile": "${workspaceFolder}/.env",
"python.terminal.useEnvFile": true
```