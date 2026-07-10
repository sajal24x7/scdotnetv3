---
tags:
  - "#powershell"
aliases:
  - Install powershell modules
  - Install offline modules powershell
---

Download module and put it in below path on a VM that does not have internet access.
```powershell
Save-Module -Name <modulename> -Path <localpath>
```

```cmd
C:\Program Files\WindowsPowerShell\Modules
```

---
references:
[Save-Module (PowerShellGet) - PowerShell | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/powershellget/save-module?view=powershell-7.3)