---
aliases:
  - How to trigger manual replication in DC
tags:
  - "#powershell"
  - "#ad"
  - "#windows"
  - "#repadmin"
category: til
updated: 2026-08-25T14:30:56
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