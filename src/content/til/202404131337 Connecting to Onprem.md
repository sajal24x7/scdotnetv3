---
title: Connecting to Onprem
slug: connecting-to-onprem
created: '2024-04-13T13:37:00+03:00'
updated: '2024-04-13T13:37:00+03:00'
category: til
tags:
- azure
- network
---

- Many Azure services have external, Internet facing endpoints however often private connectivity is required
- ﻿﻿There are a number of options to connect to virtual networks
	- ﻿﻿P2S VPN - Connects a specific device to a virtual network
	- ﻿﻿S2S VPN - Connects a network to a virtual network
	- ﻿﻿S2S VPN gateways enable multiple VPN connections to different networks if route not policy based
	- ﻿﻿ExpressRoute Private Peering - Connects a network to a virtual network via peering location and ExpressRoute Gateway (or at least mostly)
	- ﻿﻿ExpressRoute circuits enable multiple virtual networks to be connected to a single circuit but net to vnet better via peering where practical
- ﻿﻿Most enterprises will leverage ExpressRoute which has the benefit of not going over the Internet, consistent latency and can also provides optional Microsoft peering via route filter

# [[202407151913 Azure VPN|Azure VPN]]

# [[202404141339 Azure ExpressRoute|Express Route]]
- Private but not encrypted
- MSFT don't provide connection from meet me to your dc/location

---
# references:
[ExpressRoute Locations](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-locations)
[ExpressRoute overview](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-introduction)