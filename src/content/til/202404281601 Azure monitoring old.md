---
title: Azure Monitoring Old
slug: azure-monitoring-old
created: '2024-04-28T16:01:00+03:00'
updated: '2024-04-28T16:01:00+03:00'
category: til
tags:
  - azure
  - monitoring
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754939347161411'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnjgjh3p2l'
---

- [[202312231415 Azure Master|Azure]] is shared responsibility model
- As we go from IaaS to PaaS to SaaS, we are responsible for less stuff
- I might not be responsible ([[202404281600 RACI matrix|RACI]]) for something, but I might be accountable for it. Might be a regulatory requirement. 
	- [[202404281601 Azure monitoring old|Azure monitoring]] allows for us to do that.
- Monitoring is available for all resources, usually a tab under the resource
# Monitoring [[202404011327 Entra ID|"Entra ID"]] - 7/30 days retention
- Sign-in logs
- Audit logs
- Provisioning logs
- 30 days for premium license

# Monitoring subscription - 90 days retention
- Activity log (Control plane logs for everything under the subscription)
- Service health

# Monitoring [[202404061212 Azure Resources|resources]] (ARM) - 93 days
- Metrics (Numerical value with Time)
	- Like CPU utilization
- Logs (Need to be configured)
	- Different for different resources

## Host logs - OS, IIS, etc
- Azure Monitor agent - needs to be deployed to capture these logs
- You configure Data Collection Rules
	- what needs to be captured

## k8s logs
- AMA --> Log Analytics Workspace 
- Prometheus metrics --> Azure Monitor Workspace

## Applications
- Metrics and Logs
- App Insight

## Rest API

# Diagnostic Settings
Where do the logs go to? And what log is captured?

| Where?                         | Why?                        | Pay For               |
| ------------------------------ | --------------------------- | --------------------- |
| Storage                        | Cheap, long-term storage    |                       |
| Event Hub                      | External SIEM               |                       |
| Log Analytics Workspace (Logs) | Storage + Analyze           | ingestion + retention |
| Azure Monitor Workspace        | Storage + Analyze / for k8s |                       |

# Log Analytics Workspace (Logs)
- has 2 years max retention
- configurable retention
## Types of Logs
- i could search and restore to analytics logs to perform richer searches, etc. from [[#Basic Logs]] or [[#Archive Logs]]
- Export table to storage or event hub periodically
	- for custom filters need to create app/serverless
### Analytics Logs
- searchable, etc.
- costliest
### Basic Logs
- 8 days retention (fixed)
- limited queries
### Archive Logs
- upto 7 years

---
# references:
[MS Learn - monitoring](https://learn.microsoft.com/en-us/training/modules/configure-azure-monitor/2-describe-key-capabilities)
