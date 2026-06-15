---
title: VMware Remove Datastores
slug: vmware-remove-datastores
created: '2022-09-21T12:47:00+03:00'
updated: '2022-09-21T12:47:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modk3pfwt72w'
---


1.  Power down all VMs on the datastore you wish to remove.
2.  Unregister all powered down VMs from inventory.
3.  Unmount the datastore from all hosts.
4.  Detach the device from all hosts.
5.  Rescan for storage devices.


---
references:
