---
title: Get Account Last Lockout Time
slug: get-account-last-lockout-time
pubDate: '2024-10-14T11:54:00+03:00'
updatedDate: '2024-10-14T11:54:00+03:00'
category: til
tags:
- powershell
- ad
---

```powershell
Get-ADUser 'accountname' -Properties * | select accountexpirationdate, accountexpires, accountlockouttime, badlogoncount, padpwdcount, lastbadpasswordattempt, lastlogondate, lockedout, passwordexpired, passwordlastset, pwdlastset | format-list
```

---
# references: