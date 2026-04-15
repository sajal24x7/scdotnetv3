---
title: Delegate permission to restore deleted ad objects
slug: delegate-permission-to-restore-deleted-ad-objects
pubDate: '2024-03-25T12:47:00+03:00'
updatedDate: '2024-03-25T12:47:00+03:00'
category: til
tags:
- ad
---

You need to delegate **Reanimate tombstones** permission on the Domain level and make it applied to **This object and all descendant objects**. You can the **Security** tab in your Domain properties to do that:


# Using ADUC, grant user/group rights to reanimate tombstone:

1. Right-click domain root and select Properties
2. On the Security tab, click Advanced
3. Click Add and select user/group account
4. Allow the Reanimate Tombstones permission and click OK

---
# references:
[How to Delegate the Restoration of Objects from Active Directory Recycle Bin | Microsoft Learn](https://learn.microsoft.com/en-us/archive/technet-wiki/20592.how-to-delegate-the-restoration-of-objects-from-active-directory-recycle-bin)