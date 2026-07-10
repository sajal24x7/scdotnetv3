---
tags:
  - vmware
aliases:
  - VMware ESXi upgrade using baselines
---
[Build numbers and versions of VMware ESXi/ESX (broadcom.com)](https://knowledge.broadcom.com/external/article/316595/build-numbers-and-versions-of-vmware-esx.html)
[VMware ESXi 7.0 Update 3q Release Notes](https://docs.vmware.com/en/VMware-vSphere/7.0/rn/vsphere-esxi-70u3q-release-notes/index.html#Patch%20Download%20and%20Installation)
# Download a zip file for patches

## For Full ISO
1. Log in to the Broadcom Support portal.
2. On the left hand side menu, click My Downloads.
3. In the search bar in the upper right side of the page enter "VMware vSphere"
4. Choose VMware vSphere
5. Under **Products** tab, select VMware VSphere Enterprise and appropriate version.
6. Click View Group on the right side of the VMware vSphere Hypervisor (ESXi) item. 
7. Use the drop-down in the upper-right to choose the desired version. 

## For patches
[Direct Link](https://support.broadcom.com/group/ecx/productdownloads?subfamily=VMware+vSphere&tab=Solutions)
1. Log in to the Broadcom Support portal.
2. On the left hand side menu, click My Downloads.
3. In the search bar in the upper right side of the page enter "VMware vSphere"
4. Choose VMware vSphere
5. Under **Solutions** tab, select VMware vSphere Enterprise and appropriate version.
6. From the list download the appropriate version.

## For HW drivers
### How to find
1. Log in to the Broadcom Support portal.
2. On the left hand side menu, click My Downloads.
3. In the search bar in the upper right side of the page enter "VMware vSphere"
4. Choose VMware vSphere
5. Under the Products Tab, choose the user entitlement for VMware vSphere (e.g. click on VMware vSphere - Enterprise).
6. Select the major version of vSphere required.
7. Select the Custom ISOs or OEM Addons tab.
8. Click on the desired Custom ISO or Addon by OEM name and ESXi version.

# Upload updates to Lifecycle Manager
1. Go to vcenter > Lifecycle Manager
2. Select the vcenter.
3. Go to Actions > Import Updates.
4. Browse and provide the zip. Let it import.
# Create baseline
1. In Lifecycle Manager, go to baselines tab.
2. Click new > Baseline
3. Select Patch
4. In select patches automatically screen, uncheck the option.
5. In select patches manually, select the appropriate release.
	1. Filter id . Esxi7.
	2. Select bugfix (it has bugfix+security)

---
# references:
[Create a Fixed Patch Baseline (vmware.com)](https://docs.vmware.com/en/VMware-vSphere/6.7/com.vmware.vsphere.update_manager.doc/GUID-748EA6C9-C293-4B75-AA33-5A4C8E6B4B05.html)
[Broadcom Link](https://knowledge.broadcom.com/external/article?articleNumber=366685)