---
title: "AD Database files location"
slug: "ad-database-files-location"
pubDate: 2025-07-29T21:41:26+03:00
updatedDate: 2025-07-29T21:41:26+03:00
category: til
tags:
  - "#ad"
  - "#windows"

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