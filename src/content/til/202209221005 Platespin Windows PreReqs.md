---
title: Platespin Windows PreReqs
slug: platespin-windows-prereqs
created: '2022-09-22T10:05:00+03:00'
updated: '2022-09-22T10:05:00+03:00'
category: til
tags: []
---


# PlateSpinPrechecks
•   Disable UAC
•   .Net 3.5
•   1 GB free on OS drive
•   Admin$ IPC$, C$ Share enabled and shoudl be accessible from Platespin server
•   Verify WMI is enabled  - Start -> Run ->  wbemtest
•   Verify DCOM installed and running on all servers in Migrate - Start -> Run -> dcomcnfg
•   VSS Service (Snapshot) to be enabled
•   Make sure there is 10% free space (In all the partitions / Volumes / LVMs) and VSS Snapshot enabled
•   Dependency (Firewall, IP Filters) " Refer to KB Article to https://www.netiq.com/support/kb/doc.php?id=7920341
•   Ensure hostname is responding back on Prod IP

# Cluster Specific pre checks
1. Discover the active node as a Windows Cluster
2. All the instances to be on single node and secondary node to be paused in failover cluster so that during the platespin copy instances should not failover to other node
2. Minimum 10% free space should be available
3. On the source server, we would require volume details with drive letters
4. Screenshot of failover cluster, instances and quorum details required.
5. On the target server once server is up, team to validate the volume and drive letters and rectify the change in case there is a change
6. To open the failover cluster, we require domain rights and reconfigure the cluster with proper volume and drive letters.
  

•   On PlateSpin Server DiscoverActiveNodeAsWindowsCluster=False (default is True)
•   Domain Account to access the Failover cluster Manager to check source settings like Disk Order, other dependency
•   Ensure resources are running on one node

---
references: