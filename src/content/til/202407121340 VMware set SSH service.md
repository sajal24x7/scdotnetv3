---
title: VMware Set SSH Service
slug: vmware-set-ssh-service
pubDate: '2024-07-12T13:40:00+03:00'
updatedDate: '2024-07-12T13:40:00+03:00'
category: til
tags:
- vmware
- powershell
---

```powershell
# Start service
get-vmhost hostname | get-vmhostservice | where-object {$_.key -eq "TSM-SSH"} | start-vmhostservice -confirm:$false

# Stop service
get-vmhost hostname | get-vmhostservice | where-object {$_.key -eq "TSM-SSH"} | start-vmhostservice -confirm:$false

# Set startup policy
# Automatic = Start automatically if any ports are open, and stop when all ports are closed
# On = Start and stop with host
# Off = Start and stop manually
get-vmhost hostname | get-vmhostservice | where-object {$_.key -eq "TSM-SSH"} | set-vmhostservice -policy "On"
```

---
# references:
[Manage ESXi SSH Using PowerCLI - Cloudy Future](https://www.cloudyfuture.net/2016/08/02/manage-esxi-ssh-using-powercli/)