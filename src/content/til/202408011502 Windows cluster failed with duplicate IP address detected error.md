---
title: Windows Cluster Failed With Duplicate IP Address Detected Error
slug: windows-cluster-failed-with-duplicate-ip-address-detected-error
pubDate: '2024-08-01T15:02:00+03:00'
updatedDate: '2024-08-01T15:02:00+03:00'
category: til
tags:
- windows
- failover
---

# Issue
1. Windows cluster server name and IP down. 
2. When trying to bring it online, it gives duplicate IP detected error.
3. Unable to ping or find the duplicate IP from outside
4. Cluster validation does not give anything error

# Cause
When we check ipconfig we found that "Microsoft Failover Cluster Virtual Adapter" has the cluster IP assigned to it in addition to APIPA on both nodes.

```text
Tunnel adapter Local Area Connection* 2:

   Connection-specific DNS Suffix  . :
   Description . . . . . . . . . . . : Microsoft Failover Cluster Virtual Adapter
   Physical Address. . . . . . . . . : 02-74-57-21-0C-CB
   DHCP Enabled. . . . . . . . . . . : No
   Autoconfiguration Enabled . . . . : Yes
   Link-local IPv6 Address . . . . . : fe80::9cf7:8358:14c4:d0cd%2(Preferred)
   IPv4 Address. . . . . . . . . . . : 10.128.100.40(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.240.0
   IPv4 Address. . . . . . . . . . . : 169.254.1.32(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :
   DHCPv6 IAID . . . . . . . . . . . : 50499581
   DHCPv6 Client DUID. . . . . . . . : 00-01-00-01-25-F3-C7-10-FA-16-3E-18-BB-3C
   NetBIOS over Tcpip. . . . . . . . : Enabled
```

# Fix
Remove the cluster IP from the adapter on both the servers

```powershell

# Get IP Address
Get-NetAdapter -IncludeHidden -Name 'Local Area Connection* 2' | Get-NetIPAddress -IPAddress '10.128.100.40'

# Remove IP address - need to confirm
Get-NetAdapter -IncludeHidden -Name 'Local Area Connection* 2' | Get-NetIPAddress -IPAddress '10.128.100.40' | Remove-NetIPAddress

```
After removing the IP, bring the cluster online.

---
# references: