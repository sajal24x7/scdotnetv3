---
aliases:
  - Storage Redundancy
tags:
  - "#azure"
  - "#storage"
category: til
updated: 2026-08-25T14:30:56
---
Related to [[202404091859 Azure Storage Account]] and [[202404071304 Resiliency Overview|resiliency]]

Talks about redundancy for [[202404091859 Azure Storage Account|Azure storage account]]

# Primary Region
## Locally redundant storage (LRS)
3 copies in the same stamp/[[202404081830 Azure Availability Zones|AZ]]

## Zone-redundant storage (ZRS)
3 copies in different [[202404081830 Azure Availability Zones|AZs]]

# Secondary Region
## Geo-redundant storage (GRS)
3 copies in a single location/[[202404081830 Azure Availability Zones|AZ]]
and then 1 async copy in a different location in secondary region
In secondary region, using LRS 3 copies.
Also Read Access (RA-GRS)

## Geo-zone-redundant storage (GZRS)
3 copies in 3 [[202404081830 Azure Availability Zones|AZs]] and 1 async copy to different location in secondary region/In secondary region, using LRS 3 copies.
Also RA-GZRS

# Block blob only object level replication
You can specify a different region to replicate to. Not just the secondary region.

---
# references:
https://learn.microsoft.com/en-in/azure/storage/common/storage-redundancy