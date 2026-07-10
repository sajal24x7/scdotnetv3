---
tags:
  - windows
aliases:
category: til
---

# Server 2003 The RPC server is unavailable while trying to take RDP
1. Go to HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server
2. Create a new key selecting Dword and name it as IgnoreRegUserConfigErrors
3. now double click it and give a value as 1


---
references: