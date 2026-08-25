---
aliases:
  - Remove for recursive objects in AD fails
tags:
  - "#ad"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
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