---
title: Create VNet Peering in Azure
slug: create-vnet-peering-in-azure
created: '2024-07-15T19:43:00+03:00'
updated: '2024-07-15T19:43:00+03:00'
category: til
tags:
  - powershell
  - azure
  - network
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754957564018488'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnrpxnbq2v'
---

After [[202407141408 Create VNet in Azure|Create VNet in Azure]]

We can create [[202407151908 VNet Peering|VNet Peering]] between the two using [[202207181612 Powershell|Powershell]] : [Add-AzVirtualNetworkPeering](https://learn.microsoft.com/en-us/powershell/module/az.network/add-azvirtualnetworkpeering)

```powershell
# Variables
$VNet1 = 'sajalvnet-0'
$VNet2 = 'sajalvnet-1'
$VNet3 = 'sajalvnet-2'
$RG = 'user-kmgvzllojmll'

# Get VNets
$AZVNet1 = Get-AzVirtualNetwork -ResourceGroupName $RG -Name $VNET1
$AZVNet2 = Get-AzVirtualNetwork -ResourceGroupName $RG -Name $VNET2
$AZVNet3 = Get-AzVirtualNetwork -ResourceGroupName $RG -Name $VNET3

# Add peering
Add-AzVirtualNetworkPeering -Name 'LocalPeering' -VirtualNetwork $AZVNet1 -RemoteVirtualNetworkId $AZVNet2.id
Add-AzVirtualNetworkPeering -Name 'LocalPeering' -VirtualNetwork $AZVNet2 -RemoteVirtualNetworkId $AZVNet1.id


# Add regional
Add-AzVirtualNetworkPeering -Name 'VNet1ToVNet3' -VirtualNetwork $AZVNet1 -RemoteVirtualNetworkId $AZVNet3.id
Add-AzVirtualNetworkPeering -Name 'VNet3ToVnet1' -VirtualNetwork $AZVNet3 -RemoteVirtualNetworkId $AZVNet1.id

```


---
# references:
