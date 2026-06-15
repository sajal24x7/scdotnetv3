---
title: Remove Child Items Skipping One
slug: remove-child-items-skipping-one
created: '2024-07-08T11:59:00+03:00'
updated: '2024-07-08T11:59:00+03:00'
category: til
tags:
  - powershell
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754949768662139'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modno62q7a26'
---

```powerhsell

Get-ChildItem -Path "C:\Windows\System32\winevt\Logs\*" -File -Include Archive-Sec* | Sort-Object LastWriteTime -Descending | Select-Object -Skip 1 | Remove-Item -Force
```

---
# references:
