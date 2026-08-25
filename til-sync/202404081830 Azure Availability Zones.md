---
aliases:
  - Availability Zones
  - AZs
  - AZ
tags:
  - "#azure"
  - "#resiliency"
category: til
updated: 2026-08-25T14:30:56
---
Related to [[202404071304 Resiliency Overview]]
Related to [[202404071420 Azure resiliency concepts]]

1. Things within a 2ms boundary
2. Isolation based on (Power, Cooling, Networking) from other [[202404081830 Azure Availability Zones|AZs]]
3. Minimum of 3 zones in every region. Even if there are more, in your subscription you will see 3.
4. There is no guaranteed distance between AZs/Not a [[202404071556 Disaster Recovery|DR]] mechanism

---
# references: