---
title: VM Replications
slug: vm-replications
pubDate: '2024-04-07T15:43:00+03:00'
updatedDate: '2024-04-07T15:43:00+03:00'
category: til
tags:
- azure
- resiliency
---

Related to [[202404071441 Replication|Replication]]

1. On-prem to azure via Azure Site Recovery
2. Azure to Azure via ASR
3. Crash and app consistent recovery points
	1. App consistent recovery points will have a little performance impact as everything needs to be dumped to disk / so that there is no data in transit/ then snapshot

---
# references: