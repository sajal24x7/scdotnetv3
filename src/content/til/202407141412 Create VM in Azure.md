---
title: Create VM in Azure
slug: create-vm-in-azure
created: '2024-07-14T14:12:00+03:00'
updated: '2024-07-14T14:12:00+03:00'
category: til
tags:
- powershell
- azure
- compute
---


# Resources
1. A [[202404051818 Resource Groups|resource group]]
2. A [[202404121703 Azure VNet|VNet]] in the [[202404051818 Resource Groups|resource group]]
3. A [[202404121727 Azure VM NIC|VM NIC]] in the [[202404121703 Azure VNet|VNet]]
4. Public IP (Needs to be added in nic resource in bicep)

# VM Config
1. VM Size
2. VM Image
3. Admin credential

```bash
az vm create --resource-group "learn-c165c4fd-2e56-45a2-ace8-195a1095e650" --no-wait --name ResearchVM --location westeurope --vnet-name ResearchVNet --subnet Data --image Ubuntu2204 --admin-username azureuser --admin-password <password>
```


```powershell
# Variabels
$RGName = "user-fiahxmxusscf"
$Region = "eastus"
$VMName = "vm1"

# Set the administrator and password for the VM. ##
$cred = Get-Credential

## Place the virtual network into a variable. ##
$vnet = Get-AzVirtualNetwork -Name 'vnet1' -ResourceGroupName $RGName

## Create a network interface for the VM. ##
$nic = @{
    Name = "nic2"
    ResourceGroupName = $RGName
    Location = $Region
    Subnet = $vnet.Subnets[0]
}
$nicVM = New-AzNetworkInterface @nic

## Create a virtual machine configuration. ##
$vmsz = @{
    VMName = $VMName
    VMSize = 'Standard_DS1_v2'  
}
$vmos = @{
    ComputerName = $VMName
    Credential = $cred
}
$vmimage = @{
    PublisherName = 'MicrosoftWindowsServer'
    Offer = 'windowsserver'
    Skus = '2022-datacenter-azure-edition'
    Version = 'latest'    
}
$vmConfig = New-AzVMConfig @vmsz | Set-AzVMOperatingSystem @vmos -Windows | Set-AzVMSourceImage @vmimage | Add-AzVMNetworkInterface -Id $nicVM.Id

## Create the VM. ##
$vm = @{
    ResourceGroupName = $RGName
    Location = $Region
    VM = $vmConfig
}
New-AzVM @vm
```

---
# references: