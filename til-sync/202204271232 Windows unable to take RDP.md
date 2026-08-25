---
aliases:
  - Windows unable to take RDP
tags:
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
---
# Server 2003 The RPC server is unavailable while trying to take RDP
1. Go to HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server
2. Create a new key selecting Dword and name it as IgnoreRegUserConfigErrors
3. now double click it and give a value as 1


---
references: