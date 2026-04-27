---
title: Installing Cliqr Agent for Vmware Cloud
slug: installing-cliqr-agent-for-vmware-cloud
pubDate: '2022-08-01T13:07:00+03:00'
updatedDate: '2022-08-01T13:07:00+03:00'
category: til
tags:
- ccs
- vmware
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