---
aliases:
  - Azure Storage Services
  - Azure storage service
tags:
  - "#azure"
  - "#storage"
category: til
updated: 2026-08-25T14:30:56
---
Extension of [[202404091847 Azure Storage Overview]]
Related to [[202404091859 Azure Storage Account]]

1. Blob
2. FileShares
3. Queues
4. Table
5. Disks
# Blob
We have:
- Blob Indexes for [[202404051739 Governance Overview|azure governance]]
- Blob inventory 
	- Go over what all you have

```mermaid
flowchart RL
block & page & append --> container --> blob 
```

Uses 3 things to store stuff:
1. Storage account
2. Containers in storage account\
3. Blobs

```mermaid
flowchart LR
account --> container --> blob
XYZ --> pictures & movies 
pictures --> abc.png & abc2.ping & abc3.png
movies --> xyz.png
```

## Types

- ﻿﻿Block (ADLSGen2 (hierarchical namespace)(NFS/SFTP))
	- By default these are flat (might show folders etc, but are not actually folders)/ but we can enable hierarchical namespace
- ﻿﻿Page (Random - For OS/VM data disks,etc.)
- ﻿﻿Append (for logs)

# Table
```mermaid
flowchart RL
Entities-Key:Value --> Table
```

# Queue
```mermaid
flowchart RL
Messages --> Queue
```
- Used for some event driven things.
	Like: App writes to blob. It also puts a message in queue. A function reads the message in queue, then reads from the blob and does whatever
```mermaid
flowchart LR
App ---> |Image| Blob 
App ---> |Message|Queue --> |Event| Function 
Blob -.-> |ReadBlob|Function
```

- Not guaranteed fifo
# Files
```mermaid
flowchart RL
FoldersAndFiles --> Share-SMBorNFS --> Files
```

---
# references: