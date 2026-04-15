---
title: Powershell get ad group details
slug: powershell-get-ad-group-details
pubDate: '2024-07-16T11:52:00+03:00'
updatedDate: '2024-07-16T11:52:00+03:00'
category: til
tags:
- powershell
- ad
---

```powershell
Get-ADGroup -Filter * -SearchBase 'OU=Finland,DC=fi,DC=tcsecp,DC=com' -Properties * | select Name, Description, @{Name='MemberCount';Expression={$_.Members.Count}} | Export-Csv -Path 'C:\Users\845874.adm.FI\Desktop\test.csv' -NoClobber -NoTypeInformation -Force
```

---
# references: