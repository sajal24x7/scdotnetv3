---
title: User Defined Routing
slug: user-defined-routing
pubDate: '2024-07-28T14:01:00+03:00'
updatedDate: '2024-07-28T14:01:00+03:00'
category: til
tags:
- azure
- network
---

A way of [[202404131313 Connecting virtual networks|Connecting virtual networks]]
- Can be used to over-ride system defaults created in [[202312231415 Azure Master|Azure]]
- Next hop can be:
	- NVA
	- Virtual network gateway
	- [[202404121703 Azure VNet|VNet]]
	- Internet
	- None (To drop packet)

[[202407281408 Create custom route|Create custom route]]

---
# references:
[MS Learn](https://learn.microsoft.com/en-in/training/modules/control-network-traffic-flow-with-routes/2-azure-virtual-network-route)