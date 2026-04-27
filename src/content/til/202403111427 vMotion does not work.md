---
title: vMotion Does Not Work
slug: vmotion-does-not-work
pubDate: '2024-03-11T14:27:00+03:00'
updatedDate: '2024-03-11T14:27:00+03:00'
category: til
tags:
- vmware
---

```text
Error:

The vMotion failed because the destination host did not receive data from the source host on the vMotion network. Please check your vMotion network settings and physical network configuration and ensure they are correct.

```

# Check ping

```bash
vmkping -I vmkX x.x.x.x  
  
#where x.x.x.x is the hostname or IP address of the server that you want to ping and vmkX is the vmkernel interface to ping out of.
```

---
# references:
[Troubleshooting vMotion fails with network errors (1030264) (vmware.com)](https://kb.vmware.com/s/article/1030264)
[Testing VMkernel network connectivity with the vmkping command (1003728) (vmware.com)](https://kb.vmware.com/s/article/1003728)
[Troubleshooting vMotion network connectivity issues (65184) (vmware.com)](https://kb.vmware.com/s/article/65184)