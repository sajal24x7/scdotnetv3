---
title: Remove for recursive objects in AD fails
slug: remove-for-recursive-objects-in-ad-fails
pubDate: '2023-12-07T15:15:00+03:00'
updatedDate: '2023-12-07T15:15:00+03:00'
category: til
tags:
- ad
- powershell
---

Issue is because of additional child-objects for an object : user or computer

For user it can be devices etc.
Object class: msExchActiveSyncDevices, for example

```powershell
## Remove fails with - The directory service can perform the requested operation only on a leaf object

## Below to get the list of all objects
Get-ADObject -SearchBase $DN -Filter *

## Remove-ADObject with -recusrsive to delete
Get-ADObject -SearchBase $DN -Filter * | Remove-ADObject -Recursive -ErrorAction Stop

```

---
# references: