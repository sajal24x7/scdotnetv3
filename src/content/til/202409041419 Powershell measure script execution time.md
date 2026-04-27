---
title: Powershell Measure Script Execution Time
slug: powershell-measure-script-execution-time
pubDate: '2024-09-04T14:19:00+03:00'
updatedDate: '2024-09-04T14:19:00+03:00'
category: til
tags:
- powershell
---

```powershell
# Use measure=command

Measure-Command {(Get-ChildItem -Recurse).Count}

```

---
# references: