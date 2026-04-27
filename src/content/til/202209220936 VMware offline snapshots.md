---
title: VMware Offline Snapshots
slug: vmware-offline-snapshots
pubDate: '2022-09-22T09:36:00+03:00'
updatedDate: '2022-09-22T09:36:00+03:00'
category: til
tags: []
---


# Why?
When using multiple vCenters in the same Single Sign on Domain (Enhanced Linked Mode), there is high potential of corruption of the domain if no offline snapshots are taken of all nodes before the changes.

# Revert
If a change must be reverted, all nodes of the Enhanced Linked Mode domain have to be restored back to this offline/consistent snapshot. All nodes must be reverted to the snapshots first, before powering any on.

# Examples when this must be done
-   vCenter Server Updates (Full Version, Update Release, or Patch Release).
-   Using the lsdoctor tool to make any changes.
-   Adding a new vCenter Server to an existing SSO domain.
-   Retiring a vCenter Server from an existing SSO domain.
-   Certificate Replacement (Machine, CA, STS, etc).

# Caution
Disable VCHA before taking snapshot backups.

---
references:
[VMware vCenter in Enhanced Linked Mode pre-changes snapshot (online or offline) best practice (85662)](https://kb.vmware.com/s/article/85662)