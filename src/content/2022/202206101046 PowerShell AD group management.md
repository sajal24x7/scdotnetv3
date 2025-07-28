---
title: PowerShell AD group management
slug: powershell-ad-group-management
pubDate: '2022-06-10T10:46:00+03:00'
updatedDate: '2022-06-10T10:46:00+03:00'
category: til
tags:
- powershell
- ad
---


# Add custom property
```powershell
$Group = Get-ADGroup <group-name> -Properties * -Server <domain>
$Group | Set-ADGroup -Add @{ gidNumber = '3000999999' }
```

# Update existing entry
```powershell
$Group = Get-ADGroup <group-name> -Properties * -Server <domain>
$Group | Set-ADGroup -Replace @{ gidNumber = '300099999' }
```

# Find groups based on a property
```powershell
Get-ADGroup -Filter "gidNumber -eq 300099999" -Server <domain> -Properties *
```

# Add member to group
```powershell
Add-ADGroupMember -Server <domain> -Identity <groupname> -Members <userid>
```


---
references: