---
tags:
  - "#powershell"
  - "#ad"
aliases:
---
```powershell
Get-ADGroup -Filter * -SearchBase 'OU=Finland,DC=fi,DC=tcsecp,DC=com' -Properties * | select Name, Description, @{Name='MemberCount';Expression={$_.Members.Count}} | Export-Csv -Path 'C:\Users\845874.adm.FI\Desktop\test.csv' -NoClobber -NoTypeInformation -Force
```

---
# references: