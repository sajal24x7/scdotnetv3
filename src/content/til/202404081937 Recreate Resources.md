---
title: "Recreate Resources"
slug: "recreate-resources"
created: 2024-04-08T19:37:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["resiliency", "disasterrecovery"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754913169631755'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modn5jobji23'
---
Related to [Disaster Recovery](/til/disaster-recovery) and [Resiliency Overview](/til/resiliency-overview) 

Most probably we are using deployment pipelines. We can rerun the pipeline to create new resources in the secondary area.
Which means what we have to ensure is whatever gets pulled into the pipeline is available in secondary locations.

1. Code repository (Geo-distributed)
2. Container registry (If using containers)

Creating things takes time so it depends on [RTO](/til/recovery-time-objective). If [RTO](/til/recovery-time-objective) is less then we have to have something running in the secondary region. But it will cost more. If RTO is more we can [recreate](/til/recreate-resources).

---
# references: