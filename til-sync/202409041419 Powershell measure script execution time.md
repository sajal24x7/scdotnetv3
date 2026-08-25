---
aliases:
  - Powershell measure script execution time
tags:
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
# Use measure=command

Measure-Command {(Get-ChildItem -Recurse).Count}

```

---
# references: