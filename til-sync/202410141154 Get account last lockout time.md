---
tags:
  - "#powershell"
  - "#ad"
aliases:
---
```powershell
Get-ADUser 'accountname' -Properties * | select accountexpirationdate, accountexpires, accountlockouttime, badlogoncount, badpwdcount, lastbadpasswordattempt, lastlogondate, lockedout, passwordexpired, passwordlastset, pwdlastset | format-list
```

---
# references: