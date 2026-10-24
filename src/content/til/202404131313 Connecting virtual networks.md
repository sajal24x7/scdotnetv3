---
title: "Connecting Virtual Networks"
slug: "connecting-virtual-networks"
created: 2024-04-13T13:13:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "network"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754920280751755'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnar2rpg2w'
---
- If you wish to have multiple subscriptions and/or use multiple regions you will have multiple virtual networks
- ﻿﻿In the past we could connect virtual networks using S25 VPN or by connecting to the same ExpressRoute circuit but both approaches have problems
- ﻿﻿[VNet Peering](/til/vnet-peering) enables [VNets](/til/azure-vnet) to be connected via the Microsoft backbone in the same or different regions (global peering)
- ﻿﻿There is a small ingress and egress charge for traffic via network peering
- IP address spaces CANNOT overlap
# [VNet Peering](/til/vnet-peering)
- Best option
- Can span subscriptions and tenants
- Not transitive i.e. VNET1 can not talk to VNET3 / Need to create peering relationship between them
	- Without peering, I could add Azure Firewall or Network virtual appliance in Hub network (VNET2) and tell:
		- VNET3 if you want to talk to VNET1, next hop is IP of that forwarder
		- VNET1 if you want to talke to VNET3, next hop is IP of that forwarder
	- This above thing is [UDR](/til/user-defined-routing)
	- There is also border gateway protocol

```mermaid
flowchart LR
VNET1 --> |Peer| VNET2 --> |Peer| VNET3
VNET1 --- |NotTransitive|VNET3
```
# [Express Route](/til/connecting-to-onprem)
- Bad idea because of latency
- Traffic goes from VNET1 to express route MeetME and then from there to VNET2
```mermaid
flowchart LR
	VNET1 --> ExpressRoute --> VNET2	
	ExpressRoute --> MeetME --> ExpressRoute
```
# [S2S VPN](/til/how-to-create-s2s-vpn)
- VPN is basically encrypting traffic
- Bad idea because of bad throughput and bandwidth
```mermaid
flowchart LR
VNET1 <--> |S2SVPN| VNET2
```

# Priority
- More specific subnet chosen
	- Between, 10.0.0.0/16 and 10.0.0.0/24, /24 route will be chosen

Between different route types for the same prefix:
1. User-defined routes
2. BGP routes
3. System routes


---
# references:
[ExpressRoute Locations](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-locations)
[MS Learn](https://learn.microsoft.com/en-in/training/modules/control-network-traffic-flow-with-routes/2-azure-virtual-network-route)