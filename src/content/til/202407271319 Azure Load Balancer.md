---
title: Azure Load Balancer
slug: azure-load-balancer
created: '2024-07-27T13:19:00+03:00'
updated: '2024-07-27T13:19:00+03:00'
category: til
tags:
- azure
- network
---

- provides high availability
- uses 5-tuple hash by default to forward traffic (source ip/port, destination ip/port, protocol)
- frontend connects to LB. LB connects to backend based on rules and health checks.
- can be used for inbound or outbound scenarios
- [[202407281423 Create Azure Load Balancer|Create Azure Load Balancer]] / needs:
	- frontend ip
	- backend pool
	- health probe
	- LB rules
# Types
- public 
- internal

# Distribution methods
- 5 tuple hash
- source ip affinity
	- 2-tuple hash (source ip, destination ip)
	- 3-tuple hash (source ip, destination ip, protocol)
# SKUs
- basic
	- open by default
	- inbound only
	- http/tcp probes
	- upto 300 backend pools
	- vms in a single availability set or [[202404181846 Azure VM scale sets|VMSS]]
	- supports basic [[202407271143 Public IP address allows inbound access based on tier in Azure|Public IP Address]]
- standard
	- closed by default
	- inbound/outbound
	- http/https/tcp probes
	- upto 1000 backend pools
	- vms in a [[202404121703 Azure VNet|VNet]]
- gateway
	- high performance
	- with NVAs
# Backend pools
# Health probes
- http probe
	- pings every 15 seconds
	- http 200 response means healthy within timeout period (default 31 sec)
- tcp probe
	- creates a tcp session. 

# LB rules
## Stickiness
- By default traffic can go to any VM
- With persistence we can set which requests go to the same vm: 
	- none
	- client ip
	- Client IP and protocol

---
# references:
[MS Learn](https://learn.microsoft.com/en-us/training/modules/configure-azure-load-balancer/2-determine-uses)
> - To implement a load balancer, you configure four components:
    - Front-end IP configuration
    - Back-end pools
    - Health probes
    - Load-balancing rules


>- To configure a probe, you specify values for the following settings:
    - **Port**: Back-end port
    - **URI**: URI for requesting the health status from the backend
    - **Interval**: Amount of time between probe attempts (default is 15 seconds)
    - **Unhealthy threshold**: Number of failures that must occur for the instance to be considered unhealthy

[MS Learn](https://learn.microsoft.com/en-in/training/modules/improve-app-scalability-resiliency-with-load-balancer/3-public-load-balancer)
