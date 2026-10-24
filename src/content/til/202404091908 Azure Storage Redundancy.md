---
title: "Azure Storage Redundancy"
slug: "azure-storage-redundancy"
created: 2024-04-09T19:08:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "storage"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754915402539160'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modn6kayoc2p'
---
Related to [Azure Storage Account](/til/azure-storage-account) and [resiliency](/til/resiliency-overview)

Talks about redundancy for [Azure storage account](/til/azure-storage-account)

# Primary Region
## Locally redundant storage (LRS)
3 copies in the same stamp/[AZ](/til/azure-availability-zones)

## Zone-redundant storage (ZRS)
3 copies in different [AZs](/til/azure-availability-zones)

# Secondary Region
## Geo-redundant storage (GRS)
3 copies in a single location/[AZ](/til/azure-availability-zones)
and then 1 async copy in a different location in secondary region
In secondary region, using LRS 3 copies.
Also Read Access (RA-GRS)

## Geo-zone-redundant storage (GZRS)
3 copies in 3 [AZs](/til/azure-availability-zones) and 1 async copy to different location in secondary region/In secondary region, using LRS 3 copies.
Also RA-GZRS

# Block blob only object level replication
You can specify a different region to replicate to. Not just the secondary region.

---
# references:
https://learn.microsoft.com/en-in/azure/storage/common/storage-redundancy