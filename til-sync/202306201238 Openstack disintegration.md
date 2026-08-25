---
aliases:
  - Openstack disintegration
tags:
  - "#openstack"
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
---
- Restart of VMs to update managed by openstack to managed by VMware
- shared Disk allocated by Openstack / Same DC
- replicated disks moved
- svmotion for the shared disk
- backup/restore option not pursued
- Rebuilding VMs from vmx file

--> Cluster/shared disk can be remapped without downtime by storage team

---
# references: