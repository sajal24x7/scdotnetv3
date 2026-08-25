---
aliases:
  - Azure storage
tags:
  - "#azure"
  - "#storage"
category: til
updated: 2026-08-25T14:30:56
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