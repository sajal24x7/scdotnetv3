---
aliases:
  - Powershell run commands on remote servers
tags:
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
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