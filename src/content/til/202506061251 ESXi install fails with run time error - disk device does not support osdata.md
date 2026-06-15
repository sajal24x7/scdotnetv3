---
title: ESXi Install Fails With Run Time Error - Disk Device Does Not Support Osdata
slug: esxi-install-fails-with-run-time-error-disk-device-does-not-support-osdata
created: 2025-06-06T09:38:41.000Z
updated: 2025-06-06T09:38:41.000Z
category: til
tags:
  - vmware
  - esxi
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoe5uguh2z'
  - 'https://mastodon.social/@sajal24x7/116756407348634339'
---
If the disk is too small, then this issue can come.

---
# references:
[Changing the default size of the ESX-OSData volume in ESXi 7.0](https://williamlam.com/2020/05/changing-the-default-size-of-the-esx-osdata-volume-in-esxi-7-0.html)
>The biggest change to the partition layout is the consolidation of VMware Tools Locker, Core Dump and Scratch partitions into a new ESX-OSData volume (based on VMFS-L). This new volume can vary in size (up to 138GB) depending on a number of factors including the current ESXi boot media (USB SD-Card, Local Disk) but also the size of the device itself, which is explained in the official documentation.

[New Kernel options available on ESXi 7.0](https://knowledge.broadcom.com/external/article?legacyId=77009)
