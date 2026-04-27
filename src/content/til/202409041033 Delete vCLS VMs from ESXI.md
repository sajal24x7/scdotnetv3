---
title: Delete vCLS VMs From ESXI
slug: delete-vcls-vms-from-esxi
pubDate: '2024-09-04T10:33:00+03:00'
updatedDate: '2024-09-04T10:33:00+03:00'
category: til
tags:
- vmware
---

Useful when trying to remove datastore from ESXi and the vCLS VM is running on it. 

Putting esxi in MM just shuts off the VM and not delete it.

# Fix
1. Change vCLS Mode to Retreat mode instead of 

---
# references: