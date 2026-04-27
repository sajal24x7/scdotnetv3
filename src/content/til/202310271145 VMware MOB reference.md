---
title: VMware MOB Reference
slug: vmware-mob-reference
pubDate: '2023-10-27T11:45:00+03:00'
updatedDate: '2023-10-27T11:45:00+03:00'
category: til
tags:
- vmware
---

Access the url
```text
https://hostname.yourcompany.com/mob
```

## Enable MOB on ESXi
1. Select the host in the vSphere Client and go to Advanced System Settings.
2. Find Config.HostAgent.plugins.solo.enableMob and enable the MOB

## How to access stuff
1. Click on the content property.
2. Under the _Name_ column, locate _rootFolder_ and click its corresponding value, this being a _Data Center Folder_ object.
3. Under root > datacenter
4. Under datacenter > hostfolder
5. Under hostfolder > childEntity (Select appropriate cluster)\
6. Under that find host (select appropriate host)
7. Under that storage


### For storage

content --> rootFolder --> childEntity --> hostFolder --> childEntity -->  host --> config  --> HostStorageDeviceInfo --> Select appropriate lun


Host -> config -> storageDevice -> scsiLun [selected interested lun from list] -> standardInquiry


---
# references:
[Using the MOB to Explore the Object Model (vmware.com)](https://vdc-repo.vmware.com/vmwb-repository/dcr-public/f1c3b41b-ead5-4d47-aca4-33298d5a4fcf/778a00f3-a9b6-42f4-8f22-7216733f5f03/doc/PG_Appx_Using_MOB.20.2.html)
[Exploring the vSphere API with Managed Object Browser (altaro.com)](https://www.altaro.com/vmware/exploring-the-vsphere-api-with-managed-object-browser/)