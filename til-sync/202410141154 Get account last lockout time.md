---
aliases:
  - Get account last lockout time
tags:
  - "#powershell"
  - "#ad"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
Get-ADUser 'accountname' -Properties * | select accountexpirationdate, accountexpires, accountlockouttime, badlogoncount, badpwdcount, lastbadpasswordattempt, lastlogondate, lockedout, passwordexpired, passwordlastset, pwdlastset | format-list
```

---
# references: