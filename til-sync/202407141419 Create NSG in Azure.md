---
aliases:
  - Create NSG in Azure
tags:
  - "#powershell"
  - "#azure"
category: til
updated: 2026-08-25T14:30:56
---
```powershell

# Variables
$RGName = "user-fiahxmxusscf"
$Region = "eastus"
$port=8081 
$rulename="allowAppPort$port" 
$nsgname="sf-vnet-security"
$NICName = "nic2"


# Create NSG
New-AzNetworkSecurityGroup -Name $nsgname -ResourceGroupName $RGName  -Location $Region

# Attach NSG to VM NIC
## Get NIC
$VMNIC = Get-AzNetworkInterface -Name $NICName -ResourceGroupName $RGName

## Get NSG
$NSG = Get-AzNetworkSecurityGroup -Name $nsgname -ResourceGroupName $RGName

##Attach NSG
$VMNIC.NetworkSecurityGroup = $NSG

## Set NIC
$VMNIC | Set-AzNetworkInterface



```

---
# references: