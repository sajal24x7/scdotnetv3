---
title: Create Azure Load Balancer
slug: create-azure-load-balancer
pubDate: '2024-07-28T14:23:00+03:00'
updatedDate: '2024-07-28T14:23:00+03:00'
category: til
tags:
- powershell
- azure
---

# Public [[202407271319 Azure Load Balancer|Azure Load Balancer]]
```powershell
# Vars
$RGName = ''

# create public ip address

$Location = $(Get-AzureRmResourceGroup -ResourceGroupName $RGName).Location

$publicIP = New-AzPublicIpAddress -ResourceGroupName $RGName -Location $Location -AllocationMethod "Static" -Name "myPublicIP"

# create frontend ip
$frontendIP = New-AzLoadBalancerFrontendIpConfig -Name "myFrontEnd" -PublicIpAddress $publicIP

# Create backend pool
$backendPool = New-AzLoadBalancerBackendAddressPoolConfig -Name "myBackEndPool"

# Create health probe
$probe = New-AzLoadBalancerProbeConfig -Name "myHealthProbe" -Protocol http -Port 80 -IntervalInSeconds 5 -ProbeCount 2 -RequestPath "/"


# Create LB rule
$lbrule = New-AzLoadBalancerRuleConfig -Name "myLoadBalancerRule" -FrontendIpConfiguration $frontendIP -BackendAddressPool $backendPool -Protocol Tcp -FrontendPort 80 -BackendPort 80 -Probe $probe

# Create LB
$lb = New-AzLoadBalancer -ResourceGroupName $RGName -Name 'MyLoadBalancer' -Location $Location -FrontendIpConfiguration $frontendIP -BackendAddressPool $backendPool -Probe $probe -LoadBalancingRule $lbrule


```

# Private [[202407271319 Azure Load Balancer|Azure Load Balancer]]

---
# references: