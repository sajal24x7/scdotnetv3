---
title: How Do Azure Resources Use Resiliency
slug: how-do-azure-resources-use-resiliency
created: '2024-04-07T14:51:00+03:00'
updated: '2024-04-07T14:51:00+03:00'
category: til
tags:
  - azure
  - resiliency
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754766595199312'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modl2uvyab2w'
---

1. Some resources are global and resilient against regional failure
	1. Azure AD, Front Door, Traffic Manager, DNS zones
2. Most are deployed to specific region where services might differ
	1. Regional - don't know where anything is
	2. Zone-Redundant --> [[202312231415 Azure Master|Azure]] takes care of resiliency across different AZs
	3. Zonal --> exists in a specific zone/benefit is I know where it is

---
# references:
