---
tags:
  - "#windows"
  - "#remotedesktop"
aliases:
  - Remote Desktop
---
# Logs
Logs are under Applications and Services Logs -> Windows

# Port requirements

## RDSH to Licensing server
```text
TCP 135 - RPC  for License Server communication and RDSH
TCP 49152 - 65535 (randomly allocated) -  This is the range in Windows Server 2012,  Windows Server 2008 R2, Windows Server 2008
```

1. **TCP on port number 135**. This is the main port where communication occurs.
2. **TCP on 49152–65535** i.e. **RPC dynamic address range**. A dynamic port is assigned from this range for validation-related communication.



---
# references:
[RDS 2012: Which ports are used during deployment? | Microsoft Learn](https://learn.microsoft.com/en-us/archive/technet-wiki/16164.rds-2012-which-ports-are-used-during-deployment#Remote_Desktop_Licensing_Server)
[Connectivity Requirements for RDP Licensing Server Connectivity and Firewall Rules :: Harvesting Clouds](https://harvestingclouds.com/post/connectivity-requirements-for-rdp-licensing-server-connectivity-and-firewall-rules/)