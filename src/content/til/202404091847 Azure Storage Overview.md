---
title: Azure Storage Overview
slug: azure-storage-overview
pubDate: '2024-04-09T18:47:00+03:00'
updatedDate: '2024-04-09T18:47:00+03:00'
category: til
tags:
- azure
- storage
---

1. DNS is used for namespace/URIs are used:
```text
Of the form: - http(s)://<account>.<service>.core.windows.net/<partition>/<object>
```
# Structure
3 tier structure

| Tiers           |                                    |
| --------------- | ---------------------------------- |
| Front-end layer |                                    |
| Partition layer | Looks at structures like blobs etc |
| Stream layer    |                                    |

# Data replication
1. Intra-stamp replication (stream layer) - Synchronous and keeps data durable within the stamps
2. Inter-stamp replication (partition layer) - Asynchronous replication of data across stamps

---
# references: