---
tags:
  - "#windows"
  - "#powershell"
aliases:
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