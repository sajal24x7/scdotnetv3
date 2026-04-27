---
title: Windows RDP Issue
slug: windows-rdp-issue
pubDate: '2022-06-03T09:47:00+03:00'
updatedDate: '2022-06-03T09:47:00+03:00'
category: til
tags:
- windows
- errors
---


Error: No Remote Desktop License Servers available

```text

1. Navigate to "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\RCM\GracePeriod" as shown in below window and select the GracePeriod Key. If the ‘GracePeriod’ key exists you will need to delete it.
2. Reboot the server or Restart Remote desktop services,
```

---
references:
[Solution: No Remote Desktop License Servers Available To Provide License (devitpl.com)](https://www.blog.devitpl.com/solution-no-remote-desktop-license-servers-available-to-provide-license/)