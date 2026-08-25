---
tags:
  - powershell
  - ad
  - gpo
aliases:
category: til
updated: 2026-08-25T14:30:56
---
This takes linked GPOs from source OU and sets them on a different OU. Useful if you create a new OU for a new server version.

```powershell
$SourceOU = ''
$TargetOU = ''
$LinkedGPOs = (Get-GPInheritance -Target $SourceOU).GpoLinks
foreach ($Gpo in $LinkedGPOs) {
    New-GPLink -Guid $($Gpo.GpoId) -Target $TargetOU -Enforced No -LinkEnabled Yes
}
```