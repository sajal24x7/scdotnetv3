---
title: Azure Resource Lock
slug: azure-resource-lock
pubDate: '2024-09-02T13:26:00+03:00'
updatedDate: '2024-09-02T13:26:00+03:00'
category: til
tags:
- azure
- management
---

1. Azure Locks can be applied at [[202404061212 Azure Resources|resource]], [[202404051818 Resource Groups|resource group]] or [[202401101441 Azure subscriptions|subscription]] level
	2. No lock at [[202404051803 Management groups|management group]] level
2. inherited
	1. all child resources get the same lock
3. Types:
	1. Ready Only - can not delete or update anything / similar to reader [[202404061316 Azure Roles|role]]
	2. Delete - can read/modify but can not delete a resource


---
# references:
[Lock resources](https://learn.microsoft.com/en-in/azure/azure-resource-manager/management/lock-resources?tabs=json)