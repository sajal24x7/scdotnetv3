---
aliases:
  - Managed Disks
  - Azure Managed Disks
tags:
  - "#azure"
  - "#storage"
category: til
updated: 2026-08-25T14:30:56
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