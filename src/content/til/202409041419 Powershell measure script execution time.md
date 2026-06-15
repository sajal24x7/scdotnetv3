---
title: Powershell Measure Script Execution Time
slug: powershell-measure-script-execution-time
created: '2024-09-04T14:19:00+03:00'
updated: '2024-09-04T14:19:00+03:00'
category: til
tags:
  - powershell
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoaruou72s'
---

```powershell
# Use measure=command

Measure-Command {(Get-ChildItem -Recurse).Count}

```

---
# references:
