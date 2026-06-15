---
title: Multi-Region Deployments
slug: multi-region-deployments
created: '2024-04-07T15:18:00+03:00'
updated: '2024-04-07T15:18:00+03:00'
category: til
tags:
  - azure
  - resiliency
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754908668365702'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modn3i422h2c'
---

1. Mostly active-passive setups but can be active-active too
	1. because: latency
	2. because: data consistency
2. Deploy to at least 2 regions
3. Ensure all core elements are present in both regions
4. Some resources can not move between regions (example: public IPs)
5. Need to balance between regions
	1. Azure traffic manager is a solution for this/DNS based
	2. Azure front door
		1. creates any cast IP in edge locations
		2. when client makes request initial sessions it can do in edge
		3. when request is made it goes to closest region
	3. Cross region global LB

---
# references:
