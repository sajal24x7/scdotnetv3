---
title: Create Activity Log Alerts in Azure
slug: create-activity-log-alerts-in-azure
created: '2024-08-11T12:55:00+03:00'
updated: '2024-08-11T12:55:00+03:00'
category: til
tags:
  - azure
  - monitoring
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modo4lraoh2u'
  - 'https://mastodon.social/@sajal24x7/116756208398137951'
---

Alerting can be enabled for:
- specific actions (example: vm deleted, adding new rules to users)
- service health events 

---
# references:
[MS Learn](https://learn.microsoft.com/en-in/training/modules/incident-response-with-alerting-on-azure/6-activity-log-alerts)
>activity log alerts have their own attributes:
>- **Category**: Administrative, service health, autoscale, policy, or recommendation
>- **Scope**: Resource level, resource group level, or subscription level
>- **Resource group**: Where the alert rule is saved
>- **Resource type**: Namespace for the target of the alert
>- **Operation name**: Operation name
>- **Level**: Verbose, informational, warning, error, or critical
>- **Status**: Started, failed, or succeeded
>- **Event initiated by**: Email address or Microsoft Entra identifier (known as the "caller") for the user
