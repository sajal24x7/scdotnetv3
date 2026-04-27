---
title: Azure Resiliency Concepts
slug: azure-resiliency-concepts
pubDate: '2024-04-07T14:20:00+03:00'
updatedDate: '2024-04-07T14:20:00+03:00'
category: til
tags:
- azure
- resiliency
---

# 1. Fault domains
- common set of hardware that has a SPoF like a rack
# 2. Update Domains
- group of nodes that are upgraded together
# 2. Availability sets (99.95%)
Protection against rack level failures.
1. Logical grouping of nodes so that they are deployed over different racks.
2. So that if 1 goes down, other is available
3. Don't mix functionalities. Example 1 for DCs. 1 for sql for example.
# 3. [[202404081830 Azure Availability Zones|Availability Zones]] (99.99%)
Racks live in a DC set (separate power, cooling, network)
This provides protection again DC level failures.
Minimum of 3 zones in every region. Even if there are more, in your subscription you will see 3.
# 4. Regions and Pairs
Set of DC sets becomes a region. 2ms latency roundtrip window between DC sets/ Availability Zones.
Paired regions - main thing is azure does not update both regions at the same time

---
# references:
https://learn.microsoft.com/en-us/training/modules/configure-virtual-machine-availability/5-review-availability-zones