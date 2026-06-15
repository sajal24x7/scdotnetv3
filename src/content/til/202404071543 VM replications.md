---
title: VM Replications
slug: vm-replications
created: '2024-04-07T15:43:00+03:00'
updated: '2024-04-07T15:43:00+03:00'
category: til
tags:
  - azure
  - resiliency
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754909260138875'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modn3qq5xc2m'
---

Related to [[202404071441 Replication|Replication]]

1. On-prem to azure via Azure Site Recovery
2. Azure to Azure via ASR
3. Crash and app consistent recovery points
	1. App consistent recovery points will have a little performance impact as everything needs to be dumped to disk / so that there is no data in transit/ then snapshot

---
# references:
