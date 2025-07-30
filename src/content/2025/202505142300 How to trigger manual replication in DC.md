---
title: "How to trigger manual replication in DC"
slug: "how-to-trigger-manual-replication-in-dc"
pubDate: 2025-05-14T23:38:51+03:00
updatedDate: 2025-05-14T23:38:51+03:00
category: til
tags:
  - "#powershell"
  - "#ad"
  - "#windows"
  - "#repadmin"

---
```powershell

repadmin /syncall /AdeP

# - `/A` – All partitions
# - `/d` – Identify servers by distinguished name
# - `/e` – Enterprise (cross-site)
# - `/P` – Push replication
```
## GUI
1. Go to AD sites and services.
2. Go to site > servers > DC > NTDS settings.
3. Under that replication links will be present. Right click and sync now.


---
# references: