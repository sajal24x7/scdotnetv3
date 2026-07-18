---
title: VMware ESXi Upgrade Using ESXCLI
slug: vmware-esxi-upgrade-using-esxcli
created: '2023-08-29T17:11:00+03:00'
updated: '2023-08-29T17:11:00+03:00'
category: til
tags:
  - vmware
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754753900244894'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkv3xmiu2m'
---


```bash

## Run this to get the name
esxcli software sources profile list -d /vmfs/volumes/datastore1/ESXi7-bundle/VMware-ESXi-7.0U2d-18538813-depot.zip

## Update name after -p
esxcli software profile update -p ESXi-7.0U2d-18538813-standard -d /vmfs/volumes/datastore1/ESXi7-bundle/VMware-ESXi-7.0U2d-18538813-depot.zip


Example:
esxcli software sources profile list -d /vmfs/volumes/5da0
ab35-50b8c2e8-de81-08f1eaf4b402/VMware-ESXi-7.0.3-21424296-HPE-703.0.0.11.3.0.5-Apr2023-depot\ \(1\).zip
Name                               Vendor                      Acceptance Level  Creation Time        Modification Time
---------------------------------  --------------------------  ----------------  -------------------  -----------------
HPE-Custom-AddOn_703.0.0.11.3.0-5  Hewlett Packard Enterprise  PartnerSupported  2023-03-24T05:15:11  2023-03-24T05:15:11

esxcli software profile update -p HPE-Custom-AddOn_703.0.0.11.3.0-5 -d /vmfs/volumes/5da0
ab35-50b8c2e8-de81-08f1eaf4b402/VMware-ESXi-7.0.3-21424296-HPE-703.0.0.11.3.0.5-Apr2023-depot\ \(1\).zip

```

---
# references:
[Upgrade or Update a Host with Image Profiles (vmware.com)](https://docs.vmware.com/en/VMware-vSphere/7.0/com.vmware.esxi.upgrade.doc/GUID-E51C5DB6-F28E-42E8-ACA4-0EBDD11DF55D.html)
