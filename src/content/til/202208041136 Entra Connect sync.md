---
title: Entra Connect sync
slug: entra-connect-sync
pubDate: '2022-08-04T11:36:00+03:00'
updatedDate: '2022-08-04T11:36:00+03:00'
category: til
tags:
- azure
- entra
---

- AD is source of truth
- Entra ID instance can sync from only one Entra connect sync
- One AD can sync to multiple Entra IDs

# Types
- Entra connect sync (deployed in Windows VM)
- Entra connect cloud sync (Agents are deployed where needed/runs in cloud)

# License requirements
P1

# Architecture
|Entra ID|Azure|
|connector space|Entra objects|
|metaverse|
|connector space|AD objects|
|ADDS|Onprem|


[[202208041137 Azure AD Connect Pre-Reqs]]
[[202208041557 Export configuration of existing Azure AD Connect server]]
[[202208041439 Azure AD Connect Upgrade from old version to new version]]


---
# references:
[Azure AD Connect: Version release history - Microsoft Entra | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-version-history)
[Technical Concepts](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-sync-technical-concepts)
[Topologies for Entra Connect](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/plan-connect-topologies)