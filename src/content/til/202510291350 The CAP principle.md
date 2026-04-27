---
title: The CAP Principle
slug: the-cap-principle
pubDate: 2025-10-30T11:46:10.000Z
updatedDate: 2025-10-30T11:46:10.000Z
category: til
tags:
  - distributed-systems
  - sysadmin
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/115462954660172157'
  - 'https://bsky.app/profile/sajal24x7.bsky.social/post/3m4fvcugb232e'
  - 'https://www.threads.com/@sajal24x7/post/DQbqgBHCGkb'
---
From [The practice of cloud system administration](/bookshelf/the-practice-of-cloud-system-administration) and other places.

CAP stands for -
1. Consistency 
2. Availability 
3. Partition resistance

The CAP principle states that a distributed system can have at max two of the three.

# Consistency 
All nodes see the same data at the same time. It is not necessary that this is achieved. Some delay for replication is considered OK, depending on the use case.
# Availability 
Whether the system is up or not - that is every request receives a response, whether successful or not.

# Partition Resistance
System continues to work despite partial loss of functionality or arbitrary message loss.

This principle leads to three types of systems -
1. CA
2. CP
3. AP
