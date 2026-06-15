---
title: Windows Unable to Take RDP
slug: windows-unable-to-take-rdp
created: '2022-04-27T12:32:00+03:00'
updated: '2022-04-27T12:32:00+03:00'
category: til
tags:
  - windows
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhnq6r3r26'
---


# Server 2003 The RPC server is unavailable while trying to take RDP
1. Go to HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server
2. Create a new key selecting Dword and name it as IgnoreRegUserConfigErrors
3. now double click it and give a value as 1


---
references:
