---
aliases:
  - Azure Application Gateway
tags:
  - "#azure"
  - "#network"
category: til
updated: 2026-08-25T14:30:56
---
- When compared to [[202407271319 Azure Load Balancer|Azure Load Balancer]] this uses app layer routing as mentioned in [[202404131219 External Access]]
- can add firewall etc
# Routing
- path based routing : based on url send to different backend servers
- Multi-site routing: different web apps on the same [[202407271353 Azure Application Gateway|Azure Application Gateway]]
	- example: contoso.com and sajal.net
- can redirect traffic
	- redirect http traffic to https for example
- can rewrite http headers
- create custom error messages

# Components
- front-end ip 
	- receives the request 
	- only 1 public and 1 private ip
- web application firewall (optional)
	- checks for threats based on owasp
- listener 
	- accepts traffics and routes to backend pools based on routing rules
- back-end pools
- health probes
	- response between 200 and 399 considered healthy
	- default probe waits for 30 sec

---
# references:
[MS Learn](https://learn.microsoft.com/en-us/training/modules/configure-azure-application-gateway/2-implement)