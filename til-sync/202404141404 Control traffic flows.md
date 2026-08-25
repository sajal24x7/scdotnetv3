---
aliases:
  - control traffic flow
tags:
  - "#azure"
  - "#network"
category: til
updated: 2026-08-25T14:30:56
---
- By default traffic can freely flow within a virtual network and to any connected network
- ﻿﻿To segment and control traffic within a [[202404121703 Azure VNet|VNet]], between networks and/or external a number of approaches can be utilised
	- [[202404141413 Azure Firewall|Azure Firewall]] or [[202407281410 Network Virtual Appliance|NVA]]
	- [[202404141419 Network Security Groups|Network Security Groups]], [[202407141403 Application Security Groups|Application Security Groups]] and Service Tags
- ﻿﻿[[202404141419 Network Security Groups|NSGs]] can be applied at the subnet or NIC level but are always enforced at the NIC
	- so apply at subnet level, easier to manage
	- each subnet can have max 1 [[202404141419 Network Security Groups|NSG]] assigned to it
	- each NIC can have 0 or max 1 [[202404141419 Network Security Groups|NSG]] associated with it
- ﻿﻿[[202404141419 Network Security Groups|NSGs]] are made up of rules based on IP ranges/tags, ports and actions
- ﻿﻿[[202407141403 Application Security Groups|ASGs]] are tags applied to NICs which can be used instead of IP ranges in rules which may be easier to utilize.


---
# references: