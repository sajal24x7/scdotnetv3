---
title: "Entra Connect Sync"
slug: "entra-connect-sync"
created: 2022-08-04T11:36:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "entra"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modjymdriq2u'
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


[Azure AD Connect Pre-Reqs](/til/azure-ad-connect-pre-reqs)
[Export Configuration of Existing Azure AD Connect Server](/til/export-configuration-of-existing-azure-ad-connect-server)
[Azure AD Connect Upgrade From Old Version to New Version](/til/azure-ad-connect-upgrade-from-old-version-to-new-version)


---
# references:
[Azure AD Connect: Version release history - Microsoft Entra | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-version-history)
[Technical Concepts](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-sync-technical-concepts)
[Topologies for Entra Connect](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/plan-connect-topologies)