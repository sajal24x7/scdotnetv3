---
title: How to Trigger Manual Replication in DC
slug: how-to-trigger-manual-replication-in-dc
created: 2025-05-14T20:38:51.000Z
updated: 2025-05-14T20:38:51.000Z
category: til
tags:
  - '#powershell'
  - '#ad'
  - '#windows'
  - '#repadmin'
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoe25dgz2w'
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
