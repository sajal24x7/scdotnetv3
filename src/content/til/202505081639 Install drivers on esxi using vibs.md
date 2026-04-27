---
title: "Install Drivers on Esxi Using Vibs"
slug: "install-drivers-on-esxi-using-vibs"
pubDate: 2025-05-08T16:38:51+03:00
updatedDate: 2025-05-08T16:38:51+03:00
category: til
tags:
  - "#vmware"
  - "#hp"

---
1. Copy vib to the esxi. 
2. Run the following command.

```bash
# The path has to be absolute, absolute path starts from root. so /tmp/

#for install
esxcli software vib install -v /tmp/MEL_bootbank_nmst_4.14.3.3-1OEM.700.1.0.15525992.vib
esxcli software vib install -d {OFFLINE_BUNDLE}

# For update
esxcli software vib update -v {VIBFILE}
esxcli software vib update -d {OFFLINE_BUNDLE}
```

---
# references:
[Install HPE driver on ESXi 6.7 - Hewlett Packard Enterprise Community](https://community.hpe.com/t5/operating-system-vmware/install-hpe-driver-on-esxi-6-7/td-p/7178022)