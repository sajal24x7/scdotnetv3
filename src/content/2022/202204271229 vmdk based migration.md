---
title: vmdk based migration
slug: vmdk-based-migration
pubDate: '2022-04-27T12:29:00+03:00'
updatedDate: '2022-04-27T12:29:00+03:00'
category: til
tags:
- vmware
---


If NFS only RO
1.  Upload vmdk/vmx files to datastore, based on free space. Create the folder with VMNAME.
2.  Register the vmx file. Specify all the disks.
3.  We can look at the vmx file to view all the paths. No need to edit anything.

If NFS has RW access
1. Map the NFS to VMware.
2. Register the VM using the .vmx file.
3. After registration, update the vmdetails (network should exist on target)
4. Perform storage migration.

---
references: