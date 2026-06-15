---
title: Azure Private Link
slug: azure-private-link
created: '2024-04-14T14:42:00+03:00'
updated: '2024-04-14T14:42:00+03:00'
category: til
tags:
- azure
- network
- security
---

- When an externally facing [[202312231415 Azure Master|Azure]] PaaS service is accessed from a resource in a  [[202404121703 Azure VNet|VNet]] the traffic stays on the Azure network
- ﻿﻿The PaaS service still has an external facing endpoint that some companies do not want even with firewall/authentication lockdown
- ﻿﻿[[202404141442 Azure Private Link|Private Link]] enables PaaS services to have a private endpoint for a service instance created in a virtual network that is an avatar for that specific service instance
- ﻿﻿Can also project custom services that are behind a standard load balancer using a Private Link Service
- ﻿﻿Resources in the [[202404121703 Azure VNet|VNet]] can interact via the private endpoint directly to the service using the most efficient path
- Because it is instance specific helps stop data exfiltration
- ﻿﻿Removes the need to peer [[VNET]]s which can be important where [[202404121703 Azure VNet|VNet]]s may have overlapping IP ranges
- Mostly used in place of [[202404141435 Azure Service Endpoints and Service Endpoint Policies|Service Endpoints]]

---
# references:
[MS Learn](https://learn.microsoft.com/en-in/training/modules/configure-network-routing-endpoints/6-identify-private-link-uses)