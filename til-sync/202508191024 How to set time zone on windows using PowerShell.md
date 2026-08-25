---
aliases:
  - How to set time zone on windows using PowerShell
tags:
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
```powershell

# To set time zone
Set-TimeZone -Id 'FLE Standard Time'

# To get IDs
Get-TimeZone -ListAvailable

# To get current timezone
Get-TimeZone

```