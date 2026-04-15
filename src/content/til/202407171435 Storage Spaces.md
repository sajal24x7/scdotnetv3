---
title: Storage Spaces
slug: storage-spaces
pubDate: '2024-07-17T14:35:00+03:00'
updatedDate: '2024-07-17T14:35:00+03:00'
category: til
tags:
- windows
- storage
---

# Limitations
- not as boot or system volumes
- all drives in pool must use same [[202407161309 Sector and allocation units|Sector size]]
- FC and iscsi not supported
- Failover clusters limited to SAS

---
# references:
[List the functionalities, benefits, and use cases of Storage Spaces - Training | Microsoft Learn](https://learn.microsoft.com/en-gb/training/modules/implement-storage-spaces-storage-spaces-direct/3-list-functionality-benefits-use-cases-storage-spaces)
> - Storage layers that abstract the physical disks aren't compatible with Storage Spaces, including:
    - Pass-through disks in a virtual machine (VM).
    - Storage subsystems deployed in a separate RAID layer.

[Fault tolerance and storage efficiency on Azure Stack HCI and Windows Server clusters - Azure Stack HCI | Microsoft Learn](https://learn.microsoft.com/en-us/azure-stack/hci/concepts/fault-tolerance?toc=%2Fwindows-server%2Fstorage%2Ftoc.json&bc=%2Fwindows-server%2Fbreadcrumbs%2Ftoc.json)

[Deep Dive: The Storage Pool in Storage Spaces Direct - Microsoft Community Hub](https://techcommunity.microsoft.com/t5/storage-at-microsoft/deep-dive-the-storage-pool-in-storage-spaces-direct/ba-p/425959)
> - Storage Spaces Direct automatically creates one storage pool, which grows as your deployment grows. You do not need to modify its settings, add or remove drives from the pool, nor create new pools.
> - Storage Spaces does not keep whole copies of volumes – rather, it divides them into tiny 'slabs' which are distributed evenly across all drives in all servers. This has some practical consequences. For example, using two-way mirroring with three servers does _not_ leave one server empty. Likewise, when drives fail, all volumes are affected for the very short time it takes to repair them.
> - Leaving some unallocated 'reserve' capacity in the pool allows this fast, non-invasive, parallel repair to happen even before you replace the drive.
> - The storage pool is 're-balanced' whenever new drives are added, such as on scale-out or after replacement, to equilibrate how much data every drive is storing. This ensures all drives and all servers are always equally "full".

[Storage Spaces Direct Calculator (s2dcalc.blob.core.windows.net)](https://s2dcalc.blob.core.windows.net/www/index.html)

