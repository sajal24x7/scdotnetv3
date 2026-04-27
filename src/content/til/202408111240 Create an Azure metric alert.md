---
title: Create an Azure Metric Alert
slug: create-an-azure-metric-alert
pubDate: '2024-08-11T12:40:00+03:00'
updatedDate: '2024-08-11T12:40:00+03:00'
category: til
tags:
- azure
- monitoring
- powershell
---

```bash
az monitor metrics alert create -n "Cpu80PercentAlert" --resource-group "learn-d04808ef-bd4c-4ae1-b331-0aef3cb9b52b" --scopes $VMID --condition "max percentage CPU > 80" --description "Virtual machine is running at or greater than 80% CPU utilization" --evaluation-frequency 1m --window-size 1m --severity 3
```


```powershell

```

---
# references:
[MS Docs](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-create-rule-cli-powershell-arm)
[MS Docs metric rule](https://learn.microsoft.com/en-us/powershell/module/az.monitor/add-azmetricalertrulev2?view=azps-12.2.0)
> Create metric rule
> Add-AzMetricAlertRuleV2
> To disable: 
> Add-AzMetricAlertRuleV2 -DisableRule
>- To create a log search alert rule using PowerShell, use the [New-AzScheduledQueryRule](https://learn.microsoft.com/en-us/powershell/module/az.monitor/new-azscheduledqueryrule) cmdlet.
>- To create an activity log alert rule using PowerShell, use the [New-AzActivityLogAlert](https://learn.microsoft.com/en-us/powershell/module/az.monitor/new-azactivitylogalert) cmdlet.
