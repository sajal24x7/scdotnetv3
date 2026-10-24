---
title: "Azure NAT Gateway"
slug: "azure-nat-gateway"
created: 2026-06-22T13:55:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["network", "azure"]
---
This is the preferred approach to allow access to the internet from our subnet in Azure (Azure [SNAT](/til/about-network-translation)). There are default routes, which uses public IPs from Azure region to do this by default but the problem is those IPs keep changing at random. So, for example if you need to whitelist this IP on a service on the internet, you can't.

Azure NAT Gateway v2 is zone-redundant and there is no cost difference between the two. The Public IP v4 assigned to v2 needs to be v2 as well.

There are additional new things which can be read in the [Learn doc](https://learn.microsoft.com/en-us/azure/nat-gateway/nat-overview) like IPv6 support, higher throughput and flow log support.