---
title: Public IP address allows inbound access based on tier in Azure
slug: public-ip-address-allows-inbound-access-based-on-tier-in-azure
pubDate: '2024-07-27T11:43:00+03:00'
updatedDate: '2024-07-27T11:43:00+03:00'
category: til
tags:
- azure
- network
---

Public IP address in Azure have 2 SKUs: 
1. Standard
2. Basic (will be retired in 2025)

Standard SKU is secure by default, does not allow any inbound traffic.
Basic allows traffic by default. [[202404141419 Network Security Groups|NSGs]] can be used to control access.

If we do not specify SKU, Public IP takes Basic SKU.

Faced this issue when doing [the exercise for network routing](https://learn.microsoft.com/en-in/training/modules/configure-network-routing-endpoints/7-simulation-routing). 

# Bicep
|Name|Description|Value|
|---|---|---|
|name|Name of a public IP address SKU.|'Basic'  <br>'Standard'|
|tier|Tier of a public IP address SKU.|'Global'  <br>'Regional'|

```bicep
sku: { name: 'string' tier: 'string' }

```

[[202408041111 Create public ip address in Azure|Create public ip address in Azure]]

---
# references:
[MS Docs](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/public-ip-addresses)
[Bicep docs](https://learn.microsoft.com/en-in/azure/templates/microsoft.network/publicipaddresses?pivots=deployment-language-bicep#publicipaddresssku)