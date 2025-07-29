---
title: "About system volume information"
slug: "about-system-volume-information"
pubDate: 2025-07-29T21:41:45+03:00
updatedDate: 2025-07-29T21:41:45+03:00
category: 
tags:
  - "#windows"
  - "#powershell"

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
[Windows delete shadow copies](#)

---
# references:
[How to Clean Up System Volume Information Folder on Windows | Windows OS Hub](https://woshub.com/how-to-clean-up-system-volume-information-folder/)