---
title: "Azure Resource Graph"
slug: "azure-resource-graph"
created: 2024-06-15T11:33:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754945191984165'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnm3ohwv2s'
---
- Querying [ARM](/til/azure-resources) can be slow and expensive. There is a quota. So we use [Azure Resource Graph](/til/azure-resource-graph)
	- 12000 per hour
- Provides a Read only database
	- periodically does a full scan and overwrites as needed
	- also gets notified in case of changes. allows for change tracking.
	- is up-to-date
- Use KQL to find info from [Azure Resource Graph](/til/azure-resource-graph)
- Also has quota but it resets very fast
	- 15, resets every 5 seconds


---
# references: