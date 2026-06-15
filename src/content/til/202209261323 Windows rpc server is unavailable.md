---
title: Windows Rpc Server Is Unavailable
slug: windows-rpc-server-is-unavailable
created: '2022-09-26T13:23:00+03:00'
updated: '2022-09-26T13:23:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkdq323x2p'
  - 'https://www.threads.com/@sajal24x7/post/DZnFsN9FlUn'
---


Issue: The RPC server is unavailable while trying to take Remote Desktop of 2003

HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server
Create a new key selecting Dword and name it as IgnoreRegUserConfigErrors
now double click it and give a value as 1

---
references:
