---
title: ESX Update Fails With Error 15
slug: esx-update-fails-with-error-15
created: 2025-08-12T09:59:30.000Z
updated: 2025-08-12T09:59:30.000Z
category: til
tags:
  - vmware
  - esxi
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoeouj2w23'
  - 'https://mastodon.social/@sajal24x7/116756408849085206'
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

---
# references:

[Patching an ESXi host fails with error "esxupdate returned with exit status: 15"](https://knowledge.broadcom.com/external/article/370834/patching-an-esxi-host-fails-with-error-e.html)
