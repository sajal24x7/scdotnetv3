---
title: Azure Networking Basics
slug: azure-networking-basics
created: '2024-07-28T12:23:00+03:00'
updated: '2024-07-28T12:23:00+03:00'
category: til
tags:
  - azure
  - network
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754967934969147'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnwgcij52z'
---

- When compared to on-prem, on [[202312231415 Azure Master|Azure]] there is no hierarchy to network design.
	- There are no physical devices
- Everything is virtual
	- We can slice it into chunks per our needs
- There can be no overlap in IP address between on-prem and [[202312231415 Azure Master|Azure]] 

---
# references:
[MS Learn](https://learn.microsoft.com/en-in/training/modules/design-ip-addressing-for-azure/2-network-ip-addressing-integration)
> In Azure, you'd typically implement a network security group and a firewall. You'd use subnets to isolate front-end services, including web servers and DNS, and back-end services like databases and storage systems. Network security groups filter internal and external traffic at the network layer. A firewall has more extensive capabilities for network-layer filtering and application-layer filtering. By deploying both network security groups and a firewall, you get improved isolation of resources for a secure network architecture.
