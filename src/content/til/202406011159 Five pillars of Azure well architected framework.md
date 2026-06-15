---
title: Five Pillars of Azure Well Architected Framework
slug: five-pillars-of-azure-well-architected-framework
created: '2024-06-01T11:59:00+03:00'
updated: '2024-06-01T11:59:00+03:00'
category: til
tags:
- azure
- architecture
---

# Cost effectiveness
- traditionally, costs associates were upfront, considered capex
- moving to cloud, it is considered opex
- so can be cost effective just showing this.

- pay less for services
- related to [[202404061425 Azure Cost Management|cost]]
## how?
- plan and estimate: design and then use cost-estimation to figure out how much you will pay
	- get discounts where possible by using reserved instances for example. also for licenses, etc.
- optimization: design with cost optimization at the center. 
	- PaaS is better than IaaS. choose service levels, etc based on usage requirements.
	- optimize consumption based pricing: compare prices for dedicated vs consumption based pricing for apps.
	- optimize HA: active-active or active only is better than active-passive
	- clean unused apps/services
- monitoring: related to above. monitor and figure out. and then resize/optimize.
- efficiency: related to above. ensure everything is utilized effectively. reduce waste.
	- examples: VM utilization (should not be free). storage utilization (data not required to be read often, not kept in archive) etc. 

# Operational excellence
- full visibility into how your applications is working

## how?
- devops practices to ensure agility. ci/cd containers. or legacy. does not matter.
- effective monitoring - identify cost wastes and troubleshooting, etc.
- automation - reduce human errors. easier management.
- testing - reduce issues with releases.

# Performance Efficiency
- matching available resources with the demands being put on the app

## how?
- scaling up and out
	- up/vertical - make something larger
	- out/horizontal - add similar resources
	- ideally, use autoscaling
- optimize network
	- add message layer, so that requests keep flowing
- optimize storage
	- partitioning to access/manage data differently
	- caching
		- placing static content closer to users, i.e. CDNs
- identify poorly performing code or bottlenecks
	- performance monitoring

# Reliability
- how to handle failures
	- hardware failures
	- data loss
- including ha in our design

## how?
- build ha systems dependent of the sla we are committing
- recoverability/ once the below are defined, we can design accordingly
	- related to [[202404071556 Disaster Recovery|Disaster Recovery]]
	- [[202404081931 Recovery Point Objective|RPO]]
	- [[202404081933 Recovery Time Objective|RTO]]


# Security
- protecting data
- [[202404051739 Governance Overview|azure governance]] i.e. shared responsibility model depending on what you're using
## how?
- increase security in layers/ so that attacker has to do more work
	- data - exposing encryption key or using weak encryption can cause issues
	- apps - code injection and execution - eg sql injection and cross site scripting
	- vm/compute - malwares
	- networking - unnecessarily open ports are a problem
	- perimeter - ddos attacks
	- policies and access - exposure of creds. limit access. monitoring to see where logins are coming from.
	- physical - security badge stealing. door drafting, etc.


---
# references:
[MS Learn - Well architected Framework](https://learn.microsoft.com/en-in/training/paths/azure-well-architected-framework/)
[MS Learn Docs - WAF](https://learn.microsoft.com/en-in/azure/well-architected/what-is-well-architected-framework)
