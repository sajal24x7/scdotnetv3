---
aliases:
  - Azure Log Analytics
tags:
  - "#azure"
  - "#monitoring"
category: til
updated: 2026-08-25T14:30:56
---
-  a tool in [[202408041224 Azure Monitoring|Azure Monitoring]] to run queries on collected logs
- supports KQL
- we can get estimation from [[202312231415 Azure Master|Azure]] regarding how long it would take to patch a server from crowd-sourced data.
- Implicitly it has scopes:
	- like on a vm we can go and check under Logs tag
	- on a [[202404051818 Resource Groups|resource group]] we can go and check logs
- Explicitly we have scope picker in [[202408070803 Azure Log Analytics Workspace|Azure Log Analytics Workspace]] or under Logs tab under a [[202404061212 Azure Resources|resource]]
- We can query across [[202408070803 Azure Log Analytics Workspace|Azure Log Analytics Workspace]]
- pricing is pay-as-you-go
- Log data is organised in tables

---
# references:
[MS Learn](https://learn.microsoft.com/en-us/training/modules/configure-log-analytics/2-determine-uses)
[Regions that support](https://azure.microsoft.com/explore/global-infrastructure/products-by-region/)