---
title: Powershell run commands on remote servers
slug: powershell-run-commands-on-remote-servers
pubDate: '2022-06-08T11:11:00+03:00'
updatedDate: '2022-06-08T11:11:00+03:00'
category: til
tags:
- powershell
---


Use Invoke-Command to run one off commands, if no output is needed.
```powershell
$Servers | Invoke-Command -ScriptBlock { Get-Service }
```

Invoke-command can be used with New-PSSession. This can be useful when running multiple commands and you want to use the same session. Like so:
```powershell
$s = New-PSSession -ComputerName Server02 
Invoke-Command -Session $s -ScriptBlock {$p = Get-Process PowerShell}
Invoke-Command -Session $s -ScriptBlock {$p.VirtualMemorySize}
```

---
references:
[Invoke-Command (Microsoft.PowerShell.Core) - PowerShell | Microsoft Docs](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/invoke-command?view=powershell-7.2)