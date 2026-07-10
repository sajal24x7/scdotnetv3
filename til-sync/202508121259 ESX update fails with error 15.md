---
tags:
aliases:
category: til
---
Check in `/var/run/log/esxupdate.log` file, better to run the following and let it write the logs to a temporary file.

```bash
tail -f /var/log/esxupdate.log > /tmp/esxupdate.log
```

It will have error like:

```text
> cat /tmp/esxupdate.log | grep -i 'error'  
2025-08-12T09:44:57Z Er(11) esxupdate[2109082]: An esxupdate error exception was caught:  
2025-08-12T09:44:57Z Er(11) esxupdate[2109082]: esxutils.EsxcliError: Errors:  
2025-08-12T09:44:57Z Er(11) esxupdate[2109082]: Error getting data for filesystem on '/vmfs/volumes/67c5a845-d967bb36-da89-0025b502014f': Cannot open volume: /vmfs/volumes/67c5a845-d967bb36-da89-0025b502014f, skipping.  
2025-08-12T09:44:57Z Er(11) esxupdate[2109082]: esximage.Errors.InstallationError: Failed to query file system stats: Errors:  
2025-08-12T09:44:57Z Er(11) esxupdate[2109082]: Error getting data for filesystem on '/vmfs/volumes/67c5a845-d967bb36-da89-0025b502014f': Cannot open volume: /vmfs/volumes/67c5a845-d967bb36-da89-0025b502014f, skipping.
```

Fix is to remap the LUN. The issue is that the LUN may be in use. 

# Fix
1. Put the host in MM.
2. Unmap the LUN from the host. 
	1. For datastore unmount it.
	2. If unable to remove it from host, ask storage team to remove it from their end
3. After unmap it should work.

---
# references:

[Patching an ESXi host fails with error "esxupdate returned with exit status: 15"](https://knowledge.broadcom.com/external/article/370834/patching-an-esxi-host-fails-with-error-e.html)