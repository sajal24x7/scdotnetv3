---
title: Network Security Groups
slug: network-security-groups
pubDate: '2024-04-14T14:19:00+03:00'
updatedDate: '2024-04-14T14:19:00+03:00'
category: til
tags:
- azure
- network
---

- Can be used to [[202404141404 Control traffic flows|control traffic flow]]
- ﻿﻿[[202404141419 Network Security Groups|NSGs]] can be applied at the subnet or NIC level but are always enforced at the NIC
	- so apply at subnet level, easier to manage
	- each subnet can have max 1 [[202404141419 Network Security Groups|NSG]] assigned to it
	- each NIC can have 0 or max 1 [[202404141419 Network Security Groups|NSG]] associated with it
# Security Rules consist of:
1. Source
2. Destination
3. Protocol
4. Port
5. Action
6. Priority
	1. Lower priority number has higher priority

## Source and destination
1. can be CIDR
2. can be service tags
3. [[202407141403 Application Security Groups|ASG]] (Application Security Group) (Tags basically)

## Default rules

VNet, Internet, etc are service tags.
### Inbound
1. AllowVNetInBound
2. AllowAzureLoadBalancerInBound
3. DenyAllInbound
### Outbound
1. AllowVnetOutBound
2. AllowInternetOutBound
3. DenyAllOutBound

# How it works if both vnet and subnet have nsg
In terms of precedence. Whichever is the first thing traffic encounters. So,
## Incoming
- Subnet wins
## Outgoing
- VM NIC NSG wins

[[202407141419 Create NSG in Azure|Create NSG in Azure]]



---
# references:
[NSG](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview)
[MS Docs processing of NSG](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works)