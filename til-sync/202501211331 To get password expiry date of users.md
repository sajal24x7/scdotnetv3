---
tags:
  - "#powershell"
  - "#windows"
  - "#ad"
aliases:
---
```powershell
Get-ADUser -Filter * -Properties msDS-UserPasswordExpiryTimeComputed, * | Select DisplayName,SAMAccountName,Description,PasswordNeverExpires,Enabled,{n="PwdLastSet";e={[datetime]::FromFileTime($_."PwdLastSet")}},@{n="PwdExpiry";e={[datetime]::FromFileTime($_."msDS-UserPasswordExpiryTimeComputed")}},@{n="LastLogon";e={[datetime]::FromFileTime($_."LastLogon")}}
```

---
# references: