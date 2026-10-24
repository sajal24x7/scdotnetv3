---
title: "Azure Monitoring Old"
slug: "azure-monitoring-old"
created: 2024-04-28T16:01:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "monitoring"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754939347161411'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnjgjh3p2l'
---
- [Azure](/til/azure-master) is shared responsibility model
- As we go from IaaS to PaaS to SaaS, we are responsible for less stuff
- I might not be responsible ([RACI](/raci-matrix)) for something, but I might be accountable for it. Might be a regulatory requirement. 
	- [Azure monitoring](/til/azure-monitoring-old) allows for us to do that.
- Monitoring is available for all resources, usually a tab under the resource
# Monitoring ["Entra ID"](/til/entra-id) - 7/30 days retention
- Sign-in logs
- Audit logs
- Provisioning logs
- 30 days for premium license

# Monitoring subscription - 90 days retention
- Activity log (Control plane logs for everything under the subscription)
- Service health

# Monitoring [resources](/til/azure-resources) (ARM) - 93 days
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
- i could search and restore to analytics logs to perform richer searches, etc. from [#Basic Logs](/basic-logs) or [#Archive Logs](/archive-logs)
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