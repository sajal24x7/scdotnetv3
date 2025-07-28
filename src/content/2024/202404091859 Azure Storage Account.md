---
title: Azure Storage Account
slug: azure-storage-account
pubDate: '2024-04-09T18:59:00+03:00'
updatedDate: '2024-04-09T18:59:00+03:00'
category: til
tags:
- azure
- storage
---

1. Account name has to be globally unique
2. Exists in a region
3. Can have different types of [[202404071304 Resiliency Overview|resiliency]].
	1. Can impact intractability (SLA for storage accounts)
	2. Can impact durability ( [[202404091908 Azure Storage Redundancy]])
		1. LRS 11 9s
		2. ZRS 12 9s
		3. GRS 16 9s
		4. GZRS 16 9s
4. Has API access
5. Have 2 all powerful access keys (Protect them or disable them)
	1. Can be rotated if key is compromised
6. Performance varies based on tier

# Types of storage Accounts
| Type of storage account     | Supported storage services                                                                 | Redundancy options                         | Usage                                                                                                                                                                                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standard general-purpose v2 | Blob Storage (including Data Lake Storage1), Queue Storage, Table Storage, and Azure Files | LRS, GRS, RA-GRS<br>  <br>GRS,GZRS,RA-GZRS | Standard storage account type for blobs, file shares, queues, and tables. Recommended for most scenarios using Azure Storage. If you want support for network file system (NFS) in Azure Files, use the premium file shares account type.                                                                                  |
| Premium block blobs         | Blob Storage (including Data Lake Storage1)                                                | LRS  <br>ZRS                               | Premium storage account type for block blobs and append blobs. Recommended for scenarios with high transaction rates or that use smaller objects or require consistently low storage latency. [Learn more about example workloads.](https://learn.microsoft.com/en-in/azure/storage/blobs/storage-blob-block-blob-premium) |
| Premium file shares         | Azure Files                                                                                | LRS  <br>ZRS                               | Premium storage account type for file shares only. Recommended for enterprise or high-performance scale applications. Use this account type if you want a storage account that supports both Server Message Block (SMB) and NFS file shares.                                                                               |
| Premium page blobs          | Page blobs only                                                                            | LRS  <br>ZRS                               | Premium storage account type for page blobs only. [Learn more about page blobs and sample use cases.](https://learn.microsoft.com/en-in/azure/storage/blobs/storage-blob-pageblob-overview)                                                                                                                                |

# Types based on performance tier
1. Standard - good for most scenarios
2. Premium - required for low latency
	1. Block blobs
	2. File shares
	3. Page blobs

# Types based on access tier
Premium is just premium.
For General purpose v2 :
For blobs:
1. Hot (Pay more to store/Pay less to retrieve)
2. Cool (Pay less to store/Pay more to retrieve)
3. Archive (Offline) 
For files:
1. Transaction optimized
2. Hot
3. Cool

[[202404121117 Azure Storage Services]]
# Money
1. For standard cost is consumption-based
2. For premium cost is provision-based
3. [[202404121254 Azure Managed Disks|Managed Disks]] are always provision-based
4. Operations and data transfer cost money too
	1. GRS etc will cost money too

# Access
1. Use [[202404011327 Entra ID|AAD]] (Preferred approach)
	1. Dataplane [[202404061249 Azure RBAC|RBAC]]
2. Access keys (Do not use)
3. Shared Access Signatures 
	1. Types: Account and Service
	2. Can create adhoc
	3. Policy can be created by service
	4. Signed by Access Keys
		1. If access key disabled, then this does not work
	5. Can do time limit, ip limit, operations restrictions.

# Encryption
1. Encrypted at rest
2. You can use your own key
3. Cross-tenant CMK supported (if you are a SaaS service and customer wants to own the key)
4. ﻿﻿Encryption scopes enable container/blob level

# Lifecycle management
1. Based on [[202404091859 Azure Storage Account#Types based on performance tier]] 
	1. you can decide to remove stuff after 90days for example
2. Create rules and let it automatically remove stuff as needed based on when it was last modified, etc.
	1. Maybe regulatory requirement

# Native Protection
1. Snapshot
2. Versioning for block blobs
3. Change feed
4. Soft delete
5. Point-in-time-restore {Replacement for snapshots} 
	1. Above 3 combine to form this

---
# references:
[Storage redundancy](https://learn.microsoft.com/en-in/azure/storage/common/storage-redundancy)
[Create an account SAS](https://learn.microsoft.com/en-in/rest/api/storageservices/create-account-sas)
[Types of Azure Storage Accounts](https://learn.microsoft.com/en-in/azure/storage/common/storage-account-overview?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json#types-of-storage-accounts)