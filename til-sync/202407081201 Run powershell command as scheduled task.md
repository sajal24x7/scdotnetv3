---
tags:
  - "#powershell"
aliases:
  - Run powershell command as scheduled task
---

Define action as:

```text
# Action as:
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

# Arguments as : -Command &{} 
-command &{get-process >> c:\fso\ServiceProcessBios.txt; get-service | where{$_.Status -eq ‘Running’} >> c:\fso\ServiceProcessBios.txt; Get-WmiObject Win32_bios >> c:\fso\ServiceProcessBios.txt}

```

---
# references:
[Use Scheduled Tasks to Run PowerShell Commands on Windows - Scripting Blog](https://devblogs.microsoft.com/scripting/use-scheduled-tasks-to-run-powershell-commands-on-windows/)