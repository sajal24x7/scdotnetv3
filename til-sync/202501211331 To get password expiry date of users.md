---
aliases:
  - To get password expiry date of users
tags:
  - "#powershell"
  - "#windows"
  - "#ad"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
Get-ADUser -Filter * -Properties msDS-UserPasswordExpiryTimeComputed, * | Select DisplayName,SAMAccountName,Description,PasswordNeverExpires,Enabled,{n="PwdLastSet";e={[datetime]::FromFileTime($_."PwdLastSet")}},@{n="PwdExpiry";e={[datetime]::FromFileTime($_."msDS-UserPasswordExpiryTimeComputed")}},@{n="LastLogon";e={[datetime]::FromFileTime($_."LastLogon")}}
```

---
# references: