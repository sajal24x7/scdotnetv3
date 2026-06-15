---
title: VMware Set SSH Service
slug: vmware-set-ssh-service
created: '2024-07-12T13:40:00+03:00'
updated: '2024-07-12T13:40:00+03:00'
category: til
tags:
  - vmware
  - powershell
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754952136373305'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnparxri26'
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
