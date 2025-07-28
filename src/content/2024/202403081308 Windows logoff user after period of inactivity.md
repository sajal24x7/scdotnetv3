---
title: Windows logoff user after period of inactivity
slug: windows-logoff-user-after-period-of-inactivity
pubDate: '2024-03-08T13:08:00+03:00'
updatedDate: '2024-03-08T13:08:00+03:00'
category: til
tags:
- windows
---

# Can be done through GPO

```text
ComputerPoplicy > Computer Configuration > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Session Time Limits > set values as follows:  
Set time limit for disconnected sessions: Enabled  5 minutes  
Set time limit for active but idle Remote Desktop Services sessions: Enabled  5minutes
```

---
# references:
[Logoff Idle Users | Microsoft Learn](https://learn.microsoft.com/en-us/archive/msdn-technet-forums/9c83443b-05f4-405c-8587-ee510063c83f)
[How can I log users off after a period of inactivity, rather than merely locking the workstation? Is there a "logoff" screen saver? - The Old New Thing (microsoft.com)](https://devblogs.microsoft.com/oldnewthing/20190723-00/?p=102727)