---
tags:
  - windows
aliases:
  - Windows delete shadow copies
  - vss shadows delete
---
```powershell

##  List
vssadmin list shadows

### List with powershell
Get-WmiObject Win32_Shadowcopy

## Delete with powershell
Get-WmiObject Win32_Shadowcopy |  ForEach-Object {$_.Delete();}

```

---
# references:
[An Underrated Technique to Delete Volume Shadow Copies - DeviceIoControl (picussecurity.com)](https://www.picussecurity.com/resource/blog/technique-to-delete-volume-shadow-copies-deviceiocontrol)