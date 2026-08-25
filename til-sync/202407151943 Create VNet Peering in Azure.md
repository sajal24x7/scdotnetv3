---
aliases:
  - Create VNet Peering in Azure
tags:
  - "#powershell"
  - "#azure"
  - "#network"
category: til
updated: 2026-08-25T14:30:56
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