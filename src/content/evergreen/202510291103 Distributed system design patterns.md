---
title: Distributed System Design Patterns
slug: distributed-system-design-patterns
pubDate: 2025-10-29T09:11:33.000Z
updatedDate: 2025-10-29T09:11:33.000Z
category: evergreen
tags:
  - distributed-systems
  - sysadmin
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/115456684095049000'
  - 'https://bsky.app/profile/sajal24x7.bsky.social/post/3m4d47cgq5g2o'
  - 'https://www.threads.com/@sajal24x7/post/DQbT_KwjUcU'
---
From [The practice of cloud system administration](/bookshelf/the-practice-of-cloud-system-administration).

These are the three patterns:
1. Load balancer with replicated backends
	1. LB forwards query to backend server.
	2. Backend server are replicated, so any backend should give the same response for a certain query.
	3. Round-robin or slow start algorithm to assign traffic.
2. Server with multiple backend 
	1. Server receives a query and then forward it to different components. 
	2. The components all send their responses and then combine it to form the response the user gets.
3. Server tree
	1. Root receives the full query and forwards eat to leaf nodes.
	2. Each leaf node works on the query.
	3. It allows for parallel searching of a large corpus of data for example.
