---
title: "Network Security Groups"
slug: "network-security-groups"
created: 2024-04-14T14:19:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "network"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754922211056921'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnbn4pyd2o'
---
- Can be used to [control traffic flow](/til/control-traffic-flows)
- ﻿﻿[NSGs](/til/network-security-groups) can be applied at the subnet or NIC level but are always enforced at the NIC
	- so apply at subnet level, easier to manage
	- each subnet can have max 1 [NSG](/til/network-security-groups) assigned to it
	- each NIC can have 0 or max 1 [NSG](/til/network-security-groups) associated with it
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
3. [ASG](/til/application-security-groups) (Application Security Group) (Tags basically)

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

[Create NSG in Azure](/til/create-nsg-in-azure)



---
# references:
[NSG](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview)
[MS Docs processing of NSG](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works)