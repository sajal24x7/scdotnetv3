---
title: "Management Groups"
slug: "management-groups"
created: 2024-04-05T18:03:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "governance"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754764205068504'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkzrlz5f2m'
---
1. a hierarchy that can be created for better management of subscriptions
	1. All [subscriptions](/til/azure-subscriptions) under a management group inherit the conditions applied to the [management group](/til/management-groups)
2. A management group can have 6 levels of depth. It does not include the root MG. root MG has the same ID as tenant AAD ID.
3. by default all subscriptions get added to root MG.
4. 1 MG can have only 1 parent, but multiple children

---
# references: