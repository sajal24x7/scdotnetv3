---
tags:
  - "#windows"
aliases:
---
# Registry
Registry Hive: HKEY_LOCAL_MACHINE  
Registry Path: \SOFTWARE\Microsoft\Windows\CurrentVersion\policies\Explorer\  
  
Value Name: NoDriveTypeAutoRun  
  
Value Type: REG_DWORD  
Value: 0x000000ff (255)


# GPO
```text
Computer Configuration >> Administrative Templates >> Windows Components >> AutoPlay Policies >> "Turn off AutoPlay" to "Enabled:All Drives".
```


---
# references:
[Autoplay must be disabled for all drives. (stigviewer.com)](https://www.stigviewer.com/stig/windows_10/2019-01-04/finding/V-63673)