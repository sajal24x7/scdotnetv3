---
title: "The CAP principle"
slug: "the-cap-principle"
pubDate: 2025-10-30T13:46:10+02:00
updatedDate: 2025-10-30T13:46:10+02:00
category: til
tags:
  - distributed-systems
  - sysadmin

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