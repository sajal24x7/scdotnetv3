---
title: Azure VM Scale Sets
slug: azure-vm-scale-sets
created: '2024-04-18T18:46:00+03:00'
updated: '2024-04-18T18:46:00+03:00'
category: til
tags:
- azure
- compute
---

- VMSS allows you to scale VMs in and out based on certain rules (utilization or queue) / helps with [[202404071304 Resiliency Overview|resiliency]]
	- For example: if cpu utilization goes above 70% add 2 more VMs
	- max: 1000
- These are just [[202404161835 Azure VM Basics|Azure VM]]s so nothing special in that way. You can interact with them whichever way you want.
	- These are not special. Or should not be special. So if one has any issue, it should be able to get deleted and recreated.
- this scale set is kept behind a LB.
- There are two modes: flex and uniform. But use flex. Uniform is legacy.
	- Uniform means all vms of same size 
		- for large scale stateless
	- Flex can include different sizes
- You can get termination notification
- You can look at the logs to see what has happened in the past
- When creating an [[202404161835 Azure VM Basics|Azure VM]] you can specify if you want to add it to an existing scale set.
- use [[202404171828 Azure Spot can help reduce prices for Azure VMs|Azure Spot can help reduce prices for Azure VMs]]
	- but vm can be removed at any time, so architect accordingly
	- policies: 
		- deallocate - remove compute, but disks are saved
		- delete - delete everything
- upgrade policy
	- automatic
	- rolling - so any changes to image or profile is not done for the whole scale set in one go.
	- manual
# Types of scaling
- scheduled
- automatic - based on metrics

[some faqs](https://learn.microsoft.com/en-gb/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-faq)

```azcli
# create
az vmss create --resource-group myResourceGroup --name webServerScaleSet --image Ubuntu2204 --upgrade-policy-mode automatic --custom-data cloud-init.yaml --admin-username azureuser --generate-ssh-keys

# Scale
az vmss scale --name webServerScaleSet --resource-group MyResourceGroup --new-capacity 6
```

---
# references:
[VMSS Overview](https://learn.microsoft.com/en-GB/azure/virtual-machine-scale-sets/overview)