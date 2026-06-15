---
title: Create Custom Route
slug: create-custom-route
created: '2024-07-28T14:08:00+03:00'
updated: '2024-07-28T14:08:00+03:00'
category: til
tags:
  - azure
  - network
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754969674381169'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnx7ucht2m'
---

Create a [[202407281401 User defined routing|Custom routes]]

```bash
# Create route table
az network route-table create --name publictable --resource-group "learn-62c51ac7-09ba-4d9e-a8f2-0b6f4660c3c0" --disable-bgp-route-propagation false

# create custom route
az network route-table route create --route-table-name publictable --resource-group "learn-62c51ac7-09ba-4d9e-a8f2-0b6f4660c3c0" --name productionsubnet --address-prefix 10.0.1.0/24 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.2.4

# associate subnet with route-table
az network vnet subnet update --name publicsubnet --vnet-name vnet --resource-group "learn-62c51ac7-09ba-4d9e-a8f2-0b6f4660c3c0" --route-table publictable
```



---
# references:
