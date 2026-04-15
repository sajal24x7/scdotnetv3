---
title: PowerShell registry key related
slug: powershell-registry-key-related
pubDate: '2024-02-06T14:38:00+03:00'
updatedDate: '2024-02-06T14:38:00+03:00'
category: til
tags:
- windows
- powershell
---


# Get single key
```powershell
Get-ItemProperty -Path HKLM:\Software\Microsoft\Windows\CurrentVersion -Name DevicePath -Name DevicePath

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