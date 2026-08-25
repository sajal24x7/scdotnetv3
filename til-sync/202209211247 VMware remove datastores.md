---
aliases:
  - VMware remove datastores
tags:
category: til
updated: 2026-08-25T14:30:56
---
1.  Power down all VMs on the datastore you wish to remove.
2.  Unregister all powered down VMs from inventory.
3.  Unmount the datastore from all hosts.
4.  Detach the device from all hosts.
5.  Rescan for storage devices.


---
references: