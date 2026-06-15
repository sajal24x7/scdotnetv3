---
title: How to Decommission an ESXi
slug: how-to-decommission-an-esxi
created: '2024-04-22T13:46:00+03:00'
updated: '2024-04-22T13:46:00+03:00'
category: til
tags:
- vmware
- evergreen
---

General steps are these:

1.       Put the ESXi host in maintenance mode - Compute
2.       Remove host from vDS switch - Compute
3.       Unmount and detach data LUNs / **DO NOT DELETE DATA LUNS** - Compute
4.       Remove host from the cluster (Remove from inventory) - Compute
5.       Delete boot LUN for the host, and remove host from the cluster – Storage
6.       Delete the service profile from UCS end - Compute
7.       Remove host from monitoring – SolarWinds
8.       Cleanup IPAM reservation, AD object and DNS reservation – Compute Windows
9.       Mark ESXi as decommissioned in CMDB – SNOW team

There might be some changes based on whether full cluster needs to be decommissioned.
In this case, the data luns can be deleted.

---
# references:
[How to properly decommission a VMware ESXi Host - The Tech Journal (stephenwagner.com)](https://www.stephenwagner.com/2024/01/11/how-to-properly-decommission-vmware-esxi-host/)

>Process in Short:
Enter Maintenance Mode
Remove Host from vDS Switches
Unmount and Detach iSCSI LUNs
Move host from cluster to datacenter as standalone host
Remove Host from Inventory