---
aliases:
  - Create activity log alerts in Azure
  - Activity logs
tags:
  - "#azure"
  - "#monitoring"
category: til
updated: 2026-08-25T14:30:56
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