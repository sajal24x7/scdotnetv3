---
title: "Azure Resources"
slug: "azure-resources"
created: 2024-04-06T12:12:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754764547012752'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkzwryk42m'
---
# Resource structure
```mermaid
flowchart LR
	ResourceProviders --> Resources --> Properties & Actions
	

```
- Azure Resource Manager (ARM) replaced Azure Service Manager
- ARM Resource providers have n number of resources under them
- Resources have properties and actions
- Querying ARM can be slow and expensive. There is a quota. So we use [Azure Resource Graph](/til/azure-resource-graph)
- 1 [resource](/til/azure-resources) can be a member of only 1 [RG](/til/resource-groups)
- 1 [resource](/til/azure-resources) and [resource groups](/til/resource-groups) is tagged to a single [subscription](/til/azure-subscriptions)