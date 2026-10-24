---
title: "Resource Groups"
slug: "resource-groups"
created: 2024-04-05T18:18:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "governance"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754764325805040'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkztlwwy2o'
---
Another construct for grouping together [resources](/til/azure-resources). Things that run together, might get decommissioned together, policies, etc.

1. I can create n number of [resources](/til/azure-resources) under a [subscription](/til/azure-subscriptions)
2. Can not nest resource groups i.e. can't put one RG in another RG.
3. It is not a boundary for access
4. 1 [resource](/til/azure-resources) can be a member of only 1 [RG](/til/resource-groups)
5. created in an Azure region

---
# references: