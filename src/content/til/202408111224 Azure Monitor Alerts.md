---
title: "Azure Monitor Alerts"
slug: "azure-monitor-alerts"
created: 2024-08-11T12:24:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "monitoring"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modo3ufwpq2c'
  - 'https://mastodon.social/@sajal24x7/116756208000296887'
---
We can use the [Types of monitoring data in Azure](/til/types-of-monitoring-data-in-azure) collected in [Azure monitoring](/til/azure-monitoring-old) to create alerts.

Three types of data can be used for alerts:
1. Metrics - [Create an azure metric alert](/til/create-an-azure-metric-alert)
2. Activity logs (When state changes for an [Azure resource](/til/azure-resources))
3. Logs

Alerts are created based on rules.
When an alert is triggered it is in fired state.
When it is fixed, it is in resolved state.

Action groups define what happens after alert is triggered.
once an action group is created it can be added to multiple alerts.
Use alert processing rules to override common behaviours.
# Rule components
Resource
Condition
Actions
Alert Details (Including severity)

# Limits
1. Not more than 1 call/sms every five minutes
2. Not more than 100 emails per hour



---
# references:
[MS Learn](https://learn.microsoft.com/en-in/training/modules/incident-response-with-alerting-on-azure/2-explore-azure-monitor-alert-types)
[MS Learn - action groups](https://learn.microsoft.com/en-in/training/modules/incident-response-with-alerting-on-azure/7-actions-and-alert-processing-rules)
