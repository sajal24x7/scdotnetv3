---
aliases:
  - Cloud Computing Fundamentals
tags:
  - "#cloud"
  - "#azure"
  - "#aws"
category: til
updated: 2026-08-25T14:30:56
---
# Cloud Computing provides:
## 1. On-Demand Self-Service
Create resources without requiring human interaction
## 2. Broad Network Access
Capabilities available over **network** and **standard mechanisms** (http/https,ssh,etc.)
## 3. Resource Pooling
1. Location independence.. no control or knowledge over exact location of resources
2. resources are pooled to serve multiple customers using multi-tenant model
## 4. Rapid Elasticity
1. Capabilities can be elastically provisioned and released to scale rapidly
2. To the consumer, it looks like unlimited capacity is there
## 5. Measured Service
Resources can be monitored, controlled, reported and billed

# Public vs Private vs Hybrid vs Multi Cloud
Multi cloud strategy uses multiple vendors (more than one public clouds)
Private Cloud is basically on-prem. But it still needs to meet the five characteristics we mentioned above. But, dedicated to a single customer.
Private + Public = Hybrid Cloud (Only if both act as a single cloud, i.e. same tools, processes, etc.)
Hybrid Environment/Network (private and public exist separately)

# Cloud Service Models
Infra stack contains of following components:
Application
Data
Runtime
Container
O/S
Virtualization
Servers
Infrastructure
Facilties
## Different models
In Infra stack, some things are managed by you, some by vendor, which leads to different models:
**On-Prem** controls the entire stack and staff costs.
**DC-Hosted** vendor controls facilites and staff for the HW.
**IAAS** you control O/S onward.
**PAAS** you control Runtime onward.
**SAAS** you consume application

# When to use public cloud
- shift responsibility - focus on what matters most to business
- operate dc cheaper/more efficiently on cloud
- resiliency/proximity requirements
- charged based on usage
	- predictable bursting (scale up and down based on time)
	- growing fast (new company/app - don't know how much i need)
	- unpredictable bursting
	- on and off - stop start as needed

## Key scenarios
- test and dev in cloud
- disaster recovery
- dmz scenarios (public facing things in cloud)
- special projects (initial cost (might be large) vs operating cost in cloud is less)
- many orgs are all in (maybe cheaper/but also provides lots of services/don't want to be in dc business)

---
# references:
1. https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf
2. [Azure Master Class v2 - Module 1 - Fundamentals of Cloud and Azure](https://www.youtube.com/watch?v=vkM_2vsHWA4&list=PLlVtbbG169nGlGPWs9xaLKT1KfwqREHbs&index=4)