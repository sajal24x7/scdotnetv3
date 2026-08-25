---
aliases:
  - Express Route
tags:
  - "#azure"
  - "#network"
category: til
updated: 2026-08-25T14:30:56
---
1. ExpressRoute lets you extend your on-premises networks into the Microsoft cloud over a private connection with the help of a connectivity provider.

```mermaid
flowchart LR
CustomerNetwork --> PartnerNetwork --> ExpressRouteCircuit --> MSFTEdge
```

2. Private but not encrypted
3. Has redundant connections i.e. [[202404071304 Resiliency Overview|resiliency]]

# ExpressRoute Peering Locations or MeetMe

# ExpressRoute fast path
- A key component for private peering at the gateways that run in the net which have numerous functions
	- ﻿﻿BGP
	- Part of the data path from the MSEE at the peering location to the target resource
- ﻿﻿Fastpath removes the gateways as part of the data path enabling higher throughput


---
# references:
[ExpressRoute overview](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-introduction)
[Peering Locations](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-locations-providers)