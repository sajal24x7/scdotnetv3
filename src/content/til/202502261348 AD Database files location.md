---
title: AD Database Files Location
slug: ad-database-files-location
created: 2025-02-26T10:41:26.000Z
updated: 2025-02-26T10:41:26.000Z
category: til
tags:
  - '#ad'
  - '#windows'
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modocq756w23'
---
Check in registry:  `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\NTDS\Parameters`

```text

Database log files path  
DSA Database file

```

Default: \Windows\NTDS.


---
# references:
[Windows Server 2022 permissions on the Active Directory data files must only allow System and Administrators access.](https://www.stigviewer.com/stig/microsoft_windows_server_2022/2024-06-14/finding/V-254391)
