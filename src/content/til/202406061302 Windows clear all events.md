---
title: Windows Clear All Events
slug: windows-clear-all-events
created: '2024-06-06T13:02:00+03:00'
updated: '2024-06-06T13:02:00+03:00'
category: til
tags:
  - windows
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754943721798043'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnlg26qq2w'
---

```powershell
Get-EventLog -LogName * | ForEach { Clear-EventLog $_.Log }
```

---
# references:
