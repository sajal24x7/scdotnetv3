---
aliases:
  - Manage VM Templates in VMware content libraries
tags:
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
---
After [[202407191233 Create VMware Content Libraries|Create VMware Content Libraries]]
# Add template to content library
1. Right click on VM > Clone > Clone as Template to library
2. Fill out details. It will be added to content library

Once VM template is added to content library, versioning tab becomes live. 

# Sync vm templates to subscribed library
1. Create a subscription for subscribed libraryr
2. 

---
# references:
[The VM Template as a Content Library Item (vmware.com)](https://docs.vmware.com/en/VMware-vSphere/7.0/com.vmware.vsphere.vm_admin.doc/GUID-CA4478D8-EC1B-47AD-B48E-38CD26B489FF.html#GUID-CA4478D8-EC1B-47AD-B48E-38CD26B489FF)
> - f you convert the VM template in the vCenter Server inventory to a virtual machine, the corresponding VM template library item is also deleted.
> - If you rename the VM template in the vCenter Server, the corresponding VM template library item is also renamed.
>- If you rename the VM template library item the associated VM template in the vCenter Server inventory is also renamed.
>- If you delete the VM template in the vCenter Server inventory, the corresponding VM template library item is also deleted.
>- If you delete the VM template library item, the associated VM template in the vCenter Server inventory is also deleted.