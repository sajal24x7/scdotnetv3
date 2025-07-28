---
title: Preference for replications
slug: preference-for-replications
pubDate: '2024-04-07T15:45:00+03:00'
updatedDate: '2024-04-07T15:45:00+03:00'
category: til
tags:
- azure
- resiliency
---

Related to [[202404071441 Replication|replication]] and [[202404071556 Disaster Recovery|Disaster Recovery]]

Think in this order/ best will be first/ but cost will be more as well. Think in terms of what is required. For example for app level replication app needs to be available in both places. That means vm needs to be running both places. Ideally things with state should be replicated (Remember from [[202404071304 Resiliency Overview#Understand services and dependent services]]). Others just create on-demand. Git repo/artifacts should be available wherever we are creating using IaC.

1. Native application/service multi-master
2. Native app to standby 
3. Hyper V replica at VM level
4. In-OS replication
5. Storage replication that is used by Failover cluster
6. Restoring a backup VM

---
# references: