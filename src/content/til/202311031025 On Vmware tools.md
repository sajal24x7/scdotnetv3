---
title: On Vmware Tools
slug: on-vmware-tools
pubDate: '2023-11-03T10:25:00+03:00'
updatedDate: '2023-11-03T10:25:00+03:00'
category: til
tags:
- vmware
---

VMware tools check happens with respect to the Host. Each ESXi host has a storage location for VM Tools installers, which is a configurable option and visibly referenced by the /productLocker symlink. The target can be either local to each host or point to a centralized repository of VM Tools on a shared datastore.
One possible solution is to add a shared storage as the location for the VMware tools version for all the hosts.

## Type of VMware tools
1. Tools ISO for supported OS
2. For linux: Operating System Specific Packages, or OSPs (Not managed by vSphere)
3. For Linux: Open VM Tools (OVTs) (Not managed by vSphere)
## Upgrading VMware tools
1. Automatic update on VM boot
2. Through vSphere UI
3. VMware update manager
4. In guest update - control to server owners
5. Mass updates through powerCLI
6. Native Linux package management processes
7. API

## List of VMware tools
[Build numbers and versions of VMware Tools (86165)](https://kb.vmware.com/s/article/86165)

## Deploying through SCCM


---
# references:
[VMware Tools Lifecycle: Why Tools Can Drive You Crazy (and How to Avoid it!) - VMware vSphere Blog](https://blogs.vmware.com/vsphere/2015/09/vmware-tools-lifecycle-why-tools-can-drive-you-crazy-and-how-to-avoid-it.html)
[Understanding the Three Types of VM Tools - VMware vSphere Blog](https://blogs.vmware.com/vsphere/2016/02/understanding-the-three-types-of-vm-tools.html)
[Installing and upgrading VMware Tools in vSphere (2004754)](https://kb.vmware.com/s/article/2004754)
[Six Methods for Keeping VM Tools Up to Date – VMware vSphere Blog](https://blogs.vmware.com/vsphere/2016/03/six-methods-for-keeping-vm-tools-up-to-date.html)
