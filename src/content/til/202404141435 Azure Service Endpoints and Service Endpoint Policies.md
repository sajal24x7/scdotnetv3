---
title: Azure Service Endpoints and Service Endpoint Policies
slug: azure-service-endpoints-and-service-endpoint-policies
pubDate: '2024-04-14T14:35:00+03:00'
updatedDate: '2024-04-14T14:35:00+03:00'
category: til
tags:
- azure
- network
- security
---

- [[202404141419 Network Security Groups|NSGs]] are focused on traffic into and out of the virtual network
- ﻿﻿Many Azure PaaS offerings have their own firewall capabilities to lock down access
- ﻿﻿It is often required to restrict a service to only specific subnets of specific virtual networks
- ﻿﻿[[202404141435 Azure Service Endpoints and Service Endpoint Policies|Service Endpoints]] make a specific subnet known to a specific Azure service and add optimal path to service
- ﻿﻿The virtual firewall on the service can then be configured to allow only that specific subnet
- ﻿﻿Service Endpoint Policies allow specific instances of services to be allowed from a virtual network which is not possible with NSG service tags

# Benefits
- Improved security (point 3 above/restrict Internet access and allow access only from specific subnet)
- Optimal routing for services
	- NVA force every internet going thing through the same route
	- With [[202404141435 Azure Service Endpoints and Service Endpoint Policies|Service Endpoint]], Azure traffic goes through different route
- Direct traffic to MSFT
	- Use Azure backbone network
- Low maintenance/easy config

---
# references:
[MS Learn](https://learn.microsoft.com/en-in/training/modules/configure-network-routing-endpoints/4-determine-service-endpoint-uses)