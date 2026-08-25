---
aliases:
  - Fixing system volumen information issues
tags:
  - "#windows"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
# Take ownership
takeown /f "C:\System Volume information"  

# Grant permission
icacls "C:\System Volume Information" /grant domain\user:F

## Revert
icacls "C:\System Volume Information" /setowner "NT Authority\System"
icacls "C:\System Volume Information" /remove domain\user

```

System Volume Information drives usually contain snapshot. 
[[202311031219 Windows delete shadow copies|Windows delete shadow copies]]

---
# references:
[How to Clean Up System Volume Information Folder on Windows | Windows OS Hub](https://woshub.com/how-to-clean-up-system-volume-information-folder/)