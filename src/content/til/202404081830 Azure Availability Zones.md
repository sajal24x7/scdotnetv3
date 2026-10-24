---
title: "Azure Availability Zones"
slug: "azure-availability-zones"
created: 2024-04-08T18:30:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "resiliency"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754911725008679'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modn4uocnc2m'
---
Related to [Resiliency Overview](/til/resiliency-overview)
Related to [Azure Resiliency Concepts](/til/azure-resiliency-concepts)

1. Things within a 2ms boundary
2. Isolation based on (Power, Cooling, Networking) from other [AZs](/til/azure-availability-zones)
3. Minimum of 3 zones in every region. Even if there are more, in your subscription you will see 3.
4. There is no guaranteed distance between AZs/Not a [DR](/til/disaster-recovery) mechanism

---
# references: