---
title: Windows Cluster Packet Loss Causing Failover
slug: windows-cluster-packet-loss-causing-failover
created: '2024-05-03T11:58:00+03:00'
updated: '2024-05-03T11:58:00+03:00'
category: til
tags:
- windows
- failover
- vmware
---

Windows Failover Diagnostic logs might have error 2051.

```text
[RES] SQL Server <SQL Server (OPSQL19C1VS1)>: [sqsrvres] Failure detected, diagnostics heartbeat is lost
```

To check use perfmon to add counter for "Network Interface\Packets Received Discarded"
If it has non-zero value, then we have an issue.

To fix, we can increase:
1. Click **Small Rx Buffers** and increase the value (The maximum value is 8192).
2. Click **Rx Ring #1 Size** and increase the value (The maximum value is 4096)

The settings ensure that packets which are not getting used, can get stored in buffer and processed when they can be. There can be a small performance impact.

These settings do not require reboot but may have small drop. So should be done during maintenance hours.

---
# references:
[Nodes being removed from Failover Cluster membership on VMWare ESX? | Microsoft Learn](https://learn.microsoft.com/en-us/archive/blogs/askcore/nodes-being-removed-from-failover-cluster-membership-on-vmware-esx)
[Large packet loss in the guest OS using VMXNET3 in ESXi (2039495) (vmware.com)](https://kb.vmware.com/s/article/2039495)
[windows - VMXNET3 receive buffer sizing and memory usage - Server Fault](https://serverfault.com/questions/711693/vmxnet3-receive-buffer-sizing-and-memory-usage)