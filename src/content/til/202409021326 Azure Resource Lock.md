---
title: "Azure Resource Lock"
slug: "azure-resource-lock"
created: 2024-09-02T13:26:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "management"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoahqmwz2m'
  - 'https://mastodon.social/@sajal24x7/116756211711531438'
---
1. Azure Locks can be applied at [resource](/til/azure-resources), [resource group](/til/resource-groups) or [subscription](/til/azure-subscriptions) level
	2. No lock at [management group](/til/management-groups) level
2. inherited
	1. all child resources get the same lock
3. Types:
	1. Ready Only - can not delete or update anything / similar to reader [role](/til/azure-roles)
	2. Delete - can read/modify but can not delete a resource


---
# references:
[Lock resources](https://learn.microsoft.com/en-in/azure/azure-resource-manager/management/lock-resources?tabs=json)