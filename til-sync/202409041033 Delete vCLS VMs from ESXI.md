---
tags:
  - "#vmware"
aliases:
  - Delete vCLS VMs from ESXI
---
Useful when trying to remove datastore from ESXi and the vCLS VM is running on it. 

Putting esxi in MM just shuts off the VM and not delete it.

# Fix
1. Change vCLS Mode to Retreat mode instead of 

---
# references: