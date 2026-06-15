---
title: Disable SMBv1 on Windows
slug: disable-smbv1-on-windows
created: '2024-09-16T12:36:00+03:00'
updated: '2024-09-16T12:36:00+03:00'
category: til
tags:
  - windows
  - powershell
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoaxi5yd2m'
  - 'https://mastodon.social/@sajal24x7/116756401122748172'
---

# Remove SMB v1

```powershell
# Detect
Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol

# Disable
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol
```

```powershell
# SMB v1
# Detect 
Get-SmbServerConfiguration | Select EnableSMB1Protocol

# Disable
Set-SmbServerConfiguration -EnableSMB1Protocol $false
```

---
# references:
[How to detect, enable and disable SMBv1, SMBv2, and SMBv3 in Windows | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/storage/file-server/troubleshoot/detect-enable-and-disable-smbv1-v2-v3?tabs=server)
