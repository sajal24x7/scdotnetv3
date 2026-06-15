---
title: Azure Managed Disks
slug: azure-managed-disks
created: '2024-04-12T12:54:00+03:00'
updated: '2024-04-12T12:54:00+03:00'
category: til
tags:
  - azure
  - storage
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754918087793224'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modn7r6ozl2z'
---

- As the name suggests provides a managed disk experience by abstracting the storage account
- ﻿﻿Disks are created with no visibility of storage account removing worries around IOPS per storage account
- ﻿﻿Disks and snapshots become ARM resources
- Price based on provisioned capacity
- Can be dynamically expanded for data disks (not Ultra/Premium v2)
	- never shrink
- No [[202404091908 Azure Storage Redundancy#Geo-redundant storage (GRS)]] option
	- ZRS for Std/Premium SSDv1
- SSD and Ultra disk have maxShares property
- Can have CMK (Customer Managed Key)
	- configure disk encryption set

# Types
- ﻿﻿Standard HDD
- Standard SSD
- Premium SSD (v1 and v2)
- Ultra

Premium SSD v2 and Ultra we can pick IOPS and Throughput separately. And pay accordingly.

---
# references:
