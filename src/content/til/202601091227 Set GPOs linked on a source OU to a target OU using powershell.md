---
title: "Set GPOs Linked on a Source OU to a Target OU Using Powershell"
slug: "set-gpos-linked-on-a-source-ou-to-a-target-ou-using-powershell"
created: 2026-01-09T12:27:00+02:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["powershell", "ad", "gpo"]
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