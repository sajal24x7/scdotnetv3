---
title: "Control Traffic Flows"
slug: "control-traffic-flows"
created: 2024-04-14T14:04:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "network"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754921513774316'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnbcvq7q2v'
---
- By default traffic can freely flow within a virtual network and to any connected network
- ﻿﻿To segment and control traffic within a [VNet](/til/azure-vnet), between networks and/or external a number of approaches can be utilised
	- [Azure Firewall](/til/azure-firewall) or [NVA](/til/network-virtual-appliance)
	- [Network Security Groups](/til/network-security-groups), [Application Security Groups](/til/application-security-groups) and Service Tags
- ﻿﻿[NSGs](/til/network-security-groups) can be applied at the subnet or NIC level but are always enforced at the NIC
	- so apply at subnet level, easier to manage
	- each subnet can have max 1 [NSG](/til/network-security-groups) assigned to it
	- each NIC can have 0 or max 1 [NSG](/til/network-security-groups) associated with it
- ﻿﻿[NSGs](/til/network-security-groups) are made up of rules based on IP ranges/tags, ports and actions
- ﻿﻿[ASGs](/til/application-security-groups) are tags applied to NICs which can be used instead of IP ranges in rules which may be easier to utilize.


---
# references: