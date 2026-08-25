---
aliases:
  - PowerShell registry key related
tags:
  - "#windows"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
# Get single key
```powershell
Get-ItemProperty -Path HKLM:\Software\Microsoft\Windows\CurrentVersion -Name DevicePath

## or
(Get-ItemProperty -Path HKLM:\Software\Microsoft\Windows\CurrentVersion).DevicePath

```

# Delete key
```powershell
Remove-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion -Name PSHome
Remove-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion -Name PowerShellPath


> $Path = 'HKLM:\SYSTEM\ControlSet001\Control\Session Manager\Environment'
> Remove-ItemProperty -Path $Path -Name Cloud_Setting_repositories
```



# references:
[Working with registry entries - PowerShell | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/scripting/samples/working-with-registry-entries?view=powershell-7.4)