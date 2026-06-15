---
title: Types of Operations in Azure
slug: types-of-operations-in-azure
created: '2024-07-16T21:20:00+03:00'
updated: '2024-07-16T21:20:00+03:00'
category: til
tags:
- azure
---

- These are used elsewhere like in [[202404051739 Governance Overview|azure governance]]
	- So in [[202404061249 Azure RBAC|RBAC]] what [[202404061316 Azure Roles|azure roles]] apply to which plane - control or data
	- Someone might not have access to manage a VM, but they might have access to login to the OS
# Control Plane
- To manage resource in [[202312231415 Azure Master|Azure]]
- In [[202406151100 How to interact with Azure|How to interact with Azure]], everything goes through [[202404061212 Azure Resources|ARM]]
	- All requests go to a resource manager url
	- ARM knows what exists and what does not exist and does not create duplicate resources
# Data Plane
- To access features exposed by the [[202404061212 Azure Resources|resource]]
- Requests go to specific endpoint for the Azure [[202404061212 Azure Resources|resource]]



---
# references:
[Learn - ARM](https://learn.microsoft.com/en-in/training/modules/introduction-to-infrastructure-as-code-using-bicep/3-what-azure-resource-manager)