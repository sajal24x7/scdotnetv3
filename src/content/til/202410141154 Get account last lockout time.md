---
title: Get Account Last Lockout Time
slug: get-account-last-lockout-time
created: '2024-10-14T11:54:00+03:00'
updated: '2024-10-14T11:54:00+03:00'
category: til
tags:
  - powershell
  - ad
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modobfmteh2u'
  - 'https://mastodon.social/@sajal24x7/116756401963688338'
---

```powershell
Get-ADUser 'accountname' -Properties * | select accountexpirationdate, accountexpires, accountlockouttime, badlogoncount, padpwdcount, lastbadpasswordattempt, lastlogondate, lockedout, passwordexpired, passwordlastset, pwdlastset | format-list
```

---
# references:
