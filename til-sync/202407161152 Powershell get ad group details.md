---
aliases:
  - Powershell get ad group details
tags:
  - "#powershell"
  - "#ad"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
Get-ADGroup -Filter * -SearchBase 'OU=Finland,DC=fi,DC=tcsecp,DC=com' -Properties * | select Name, Description, @{Name='MemberCount';Expression={$_.Members.Count}} | Export-Csv -Path 'C:\Users\845874.adm.FI\Desktop\test.csv' -NoClobber -NoTypeInformation -Force
```

---
# references: