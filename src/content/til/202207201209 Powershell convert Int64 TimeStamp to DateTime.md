---
title: Powershell Convert Int64 TimeStamp to DateTime
slug: powershell-convert-int64-timestamp-to-datetime
pubDate: '2022-07-20T12:09:00+03:00'
updatedDate: '2022-07-20T12:09:00+03:00'
category: til
tags:
- powershell
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