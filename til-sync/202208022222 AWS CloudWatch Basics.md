---
aliases:
  - []
tags:
  - "#inprogress"
category: til
updated: 2026-08-25T14:30:56
---
Collects and manages operational data
Three things:
1. Metrics: data relating to AWS products, apps, on-prem solutions
2. Logs
3. Events  : AWS services and schedules

## Namespace

Container for monitoring data. Naming can be anything so long as it's not `AWS/service` such as `AWS/EC2`. This is used for all metric data of that service

## Metric

Time ordered set of data points such as:

-   CPU Usage
-   Network IN/OUT
-   Disk IO

This is not for a specific server. This could get things from different servers.

Anytime CPU Utilization is reported, the **datapoint** will report:

-   Timestamp = 2019-12-03
-   Value = 98.3

**Dimensions** could be used to get metrics for a specific instance or type of instance, among others. They separate data points for different **things** or **perspectives** within the same metric.

## Alarms

Has two states `ok` or `alarm`. A notification could be sent to an SNS topic or an action could be performed based on an alarm state. Third state can be insufficient data state. Not a problem, just wait.

---
references: