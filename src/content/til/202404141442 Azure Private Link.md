---
title: "Azure Private Link"
slug: "azure-private-link"
created: 2024-04-14T14:42:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "network", "security"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754923586272510'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modncbb2gx2l'
---
- When an externally facing [Azure](/til/azure-master) PaaS service is accessed from a resource in a  [VNet](/til/azure-vnet) the traffic stays on the Azure network
- ﻿﻿The PaaS service still has an external facing endpoint that some companies do not want even with firewall/authentication lockdown
- ﻿﻿[Private Link](/til/azure-private-link) enables PaaS services to have a private endpoint for a service instance created in a virtual network that is an avatar for that specific service instance
- ﻿﻿Can also project custom services that are behind a standard load balancer using a Private Link Service
- ﻿﻿Resources in the [VNet](/til/azure-vnet) can interact via the private endpoint directly to the service using the most efficient path
- Because it is instance specific helps stop data exfiltration
- ﻿﻿Removes the need to peer [VNET](/vnet)s which can be important where [VNet](/til/azure-vnet)s may have overlapping IP ranges
- Mostly used in place of [Service Endpoints](/til/azure-service-endpoints-and-service-endpoint-policies)

---
# references:
[MS Learn](https://learn.microsoft.com/en-in/training/modules/configure-network-routing-endpoints/6-identify-private-link-uses)