---
title: Create a Log Alert in Azure
slug: create-a-log-alert-in-azure
created: '2024-08-11T12:49:00+03:00'
updated: '2024-08-11T12:49:00+03:00'
category: til
tags:
  - azure
  - monitoring
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modo4cwxk32m'
  - 'https://mastodon.social/@sajal24x7/116756208271125081'
---

- first define a log search rule
- when it evaluates as positive, an alert is triggered
- these are stateless, so everytime threshold is breached it will create an alert regardless of whether alert was created already

# How to trigger
- Number of logs
	- When a certain number of logs are generated, trigger an alert
- Metric measurement (similar to [[202408111240 Create an Azure metric alert|Create an azure metric alert]])

---
# references:
[MS Learn](https://learn.microsoft.com/en-in/training/modules/incident-response-with-alerting-on-azure/5-log-alerts)
>Log alerts behave in a slightly different way than other alert mechanisms. The first part of a log alert defines the log search rule. The rule defines how often it should run, the time period under evaluation, and the query to be run.
>When a log search evaluates as positive, it creates an alert record and triggers any associated actions.

Log search components:
>- **Log query**: Query that runs every time the alert rule fires
>- **Time period**: Time range for the query
>- **Frequency**: How often the query should run
>- **Threshold**: Trigger point for an alert to be created
