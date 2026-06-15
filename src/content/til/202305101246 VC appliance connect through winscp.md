---
title: VC Appliance Connect Through Winscp
slug: vc-appliance-connect-through-winscp
created: '2023-05-10T12:46:00+03:00'
updated: '2023-05-10T12:46:00+03:00'
category: til
tags: []
---


Error:
```text
Received too large (1433299822 B) SFTP packet. Max supported packet size is 1024000 B
```

This command changes the default shell from /bin/appliancesh to /bin/bash  
```bash
chsh -s /bin/bash root
```

Users can connect with WINSCP without getting the too large packet error.  
  
To return to the Appliance Shell, run this command:  
```bash
chsh -s /bin/appliancesh root
```

---
# references:
[Connecting to vCenter Server Virtual Appliance 6.0 using WinSCP fails with the error: Received too large SFTP packet (2115983) (vmware.com)](https://kb.vmware.com/s/article/2115983)