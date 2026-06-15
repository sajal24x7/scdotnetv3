---
title: VMware Find out When Vmotion Happened
slug: vmware-find-out-when-vmotion-happened
created: '2024-06-13T14:58:00+03:00'
updated: '2024-06-13T14:58:00+03:00'
category: til
tags:
  - vmware
  - vmotion
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754944697699620'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnludbk32m'
---

1. Go to VM logs. This is where VM folder is created. You can check on vmware console and then find the datastore where vmware.log file is present. Usually there will be older archives also.
2. Login to esxi.
3. Go to appropriate datastore. 
```shell
cd /vmfs/volumes/

# Then go to specific datastore, and vm
# Example

/vmfs/volumes/619f4a5d-3c47f70a-e703-0025b502024e/ctmhecp
```

4. cat to find instances. Note there might be duplicates so check logs accordingly.

```bash
cat vmware*.log | grep -i MigrateSetInfo
```


---
# references:
[Troubleshooting vMotion - VMware vSphere Blog](https://blogs.vmware.com/vsphere/2019/09/troubleshooting-vmotion.html)

>Virtual Machine log file entries
The virtual machine log file resides in the virtual machine home folder that also includes the vmx file and the vmdk files. Using root access on your ESXi host, you can go to appropriate folder. My test VM resides on vSAN, so I would look for the virtual machine home directory using symlink /vmfs/volumes/vsanDatastore. Using the following command shows even more information about the live-migration like the source and destination IP addresses:
