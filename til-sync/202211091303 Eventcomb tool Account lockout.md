---
aliases:
  - Eventcomb tool Account lockout
tags:
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
---
# Steps
1.  On the **Searches** menu, point to **Built In Searches**, and then click **Account Lockouts**.
    
    All domain controllers for the domain appear in the **Select To Search/Right Click To Add** box. Also, in the **Event IDs** box, you see that event IDs 529, 644, 675, 676, and 681 are added.
2. In the **Event IDs** box, type a space, and then type 12294 after the last event number

4740 event ID on DC for account lock.

---
references:
[How to use the EventCombMT utility to search event logs for account lockouts - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/windows-security/use-eventcombmt-to-search-logs-for-account-lockout)