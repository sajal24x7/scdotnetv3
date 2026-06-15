---
title: Add Rules to NSG in Azure
slug: add-rules-to-nsg-in-azure
created: '2024-07-14T14:33:00+03:00'
updated: '2024-07-14T14:33:00+03:00'
category: til
tags:
  - powershell
  - azure
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754956054090570'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnr2ra7k2p'
---

In continuation to [[202407141419 Create NSG in Azure|Create NSG in Azure]] about adding rules to [[202404141419 Network Security Groups|NSG]]

```powershell

# Variables
$RGName = "user-fiahxmxusscf"
$Region = "eastus"
$port=3389 
$rulename="Allow-RDP" 
$nsgname="sf-vnet-security"
$NICName = "nic2"

# Get the NSG resource 
$nsg = Get-AzNetworkSecurityGroup -Name $nsgname -ResourceGroupName $RGname 

# Add the inbound security rule. 
$nsg | Add-AzNetworkSecurityRuleConfig -Name $rulename -Description "Allow RDP" -Access Allow ` -Protocol * -Direction Inbound -Priority 3891 -SourceAddressPrefix "*" -SourcePortRange * ` -DestinationAddressPrefix * -DestinationPortRange $port

# Update the NSG. 
$nsg | Set-AzNetworkSecurityGroup
```


---
# references:
