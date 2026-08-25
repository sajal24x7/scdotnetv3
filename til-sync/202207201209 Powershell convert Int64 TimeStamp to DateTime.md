---
aliases:
  - Powershell convert Int64 TimeStamp to DateTime
tags:
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
we can use the .Net function **FromFileTime** and convert the output to DateTime format.
```powershell
$timestamp = "131099683087123361"
[DateTime]::FromFileTimeutc($timestamp)
```

# Example with aduser report

```powershell
Get-ADUser -Server $Domain -Properties * | Select DisplayName,DistinguishedName,Description,PasswordNeverExpires,@{n="PwdLastSet";e={[datetime]::FromFileTime($_."PwdLastSet")}}
```

---
references: