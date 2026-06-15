---
title: Openstack Disintegration
slug: openstack-disintegration
created: '2023-06-20T12:38:00+03:00'
updated: '2023-06-20T12:38:00+03:00'
category: til
tags: []
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