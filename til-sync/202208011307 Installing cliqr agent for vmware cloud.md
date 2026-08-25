---
aliases:
  - Installing cliqr agent for vmware cloud
tags:
  - "#ccs"
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
---
# Linux
```bash
./worker_installer.bin vmware worker_basic

## fORMAT
./worker_installer.bin <ostype> <cloudtype> worker_basic
```

# Windows
Download the artifacts.zip file from software.cisco.com and unzip it to obtain the installer package (cliqr_installer.exe) Or get it from cloud repo.

```cmd
cliqr_installer.exe /CLOUDTYPE=vmware /CLOUDREGION=default
```

---
references:
[CCS-WM-5-4 (cisco.com)](https://www.cisco.com/c/dam/en/us/td/docs/cloud-systems-management/cloudcenter-suite/Workload-Manager/CCS-WM-5-4.pdf)