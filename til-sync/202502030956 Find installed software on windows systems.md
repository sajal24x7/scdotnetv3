---
tags:
  - "#windows"
  - "#powershell"
aliases:
  - Find installed software on windows systems
category: til
---
```powershell

$InstalledStuff = Invoke-Command -ComputerName $Server -ScriptBlock {
        $Progs = Get-ItemProperty 'HKLM:SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*' | select DisplayName
        $Progs += Get-ItemProperty 'HKLM:SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*' | Select DisplayName
        $Progs
    }
```

---
# references:
[Use PowerShell to Quickly Find Installed Software - Scripting Blog](https://devblogs.microsoft.com/scripting/use-powershell-to-quickly-find-installed-software/)
[Win32_Product Is Evil. | Greg's Systems Management Blog](https://gregramsey.net/2012/02/20/win32_product-is-evil/)
>Even though you called a basic query of the Win32_Product class, you actually performed a consistency check of each installation.