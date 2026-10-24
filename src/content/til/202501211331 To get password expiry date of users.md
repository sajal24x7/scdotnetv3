---
title: "To Get Password Expiry Date of Users"
slug: "to-get-password-expiry-date-of-users"
created: 2025-01-21T13:31:00+02:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["powershell", "windows", "ad"]
---
```powershell
Get-ADUser -Filter * -Properties msDS-UserPasswordExpiryTimeComputed, * | Select DisplayName,SAMAccountName,Description,PasswordNeverExpires,Enabled,{n="PwdLastSet";e={[datetime]::FromFileTime($_."PwdLastSet")}},@{n="PwdExpiry";e={[datetime]::FromFileTime($_."msDS-UserPasswordExpiryTimeComputed")}},@{n="LastLogon";e={[datetime]::FromFileTime($_."LastLogon")}}
```

---
# references: