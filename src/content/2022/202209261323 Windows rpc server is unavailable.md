---
title: Windows rpc server is unavailable
slug: windows-rpc-server-is-unavailable
pubDate: '2022-09-26T13:23:00+03:00'
updatedDate: '2022-09-26T13:23:00+03:00'
category: til
tags: []
---


Issue: The RPC server is unavailable while trying to take Remote Desktop of 2003

HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server
Create a new key selecting Dword and name it as IgnoreRegUserConfigErrors
now double click it and give a value as 1

---
references: