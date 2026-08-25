---
aliases:
  - VMware convert eager zeroed disk to lazy zeroed
tags:
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
---
Conversion to lazy zeroed might not work, so better to convert disk to thin. and then do vmotion to lazy zeroed.
```ssh
vmkfstools -i /vmfs/volumes/datastoreName/VMName/VMName.vmdk /vmfs/volumes/datastoreName/VMName/temp/VMName.vmdk -d zeroedthick


vmkfstools -i /vmfs/volumes/myVMFS/templates/gold-primary.vmdk /vmfs/volumes/myVMFS/myOS.vmdk -d thin
```


---
references:
[Solved: clone virtual disk eager zero to lazy zeroed - VMware Technology Network VMTN](https://communities.vmware.com/t5/ESXi-Discussions/clone-virtual-disk-eager-zero-to-lazy-zeroed/td-p/2751823)
[Cloning or Converting a Virtual Disk or RDM (vmware.com)](https://docs.vmware.com/en/VMware-vSphere/7.0/com.vmware.vsphere.storage.doc/GUID-01D3CF47-A84A-4988-8103-A0487D6441AA.html)