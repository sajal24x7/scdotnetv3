---
tags:
  - vmware
  - esxi
  - vmware-tools
aliases:
  - Update esxi with required version of vmware tools
category: til
updated: 2026-08-25T14:30:56
---
By default each esxi release come bundled with a specific vmware tools release. Automatic upgrade option for VMs checks against this version.

To find VMware tools version on host:
```bash
esxcli software component get | grep VMware-VM-Tools -B 1 -A 14

```

## Using baseline method
1. Download the VMware tools VIB package.
	1. Go to VMWare console > Downloads > Log in to the Broadcom Support portal.
	2. On the left hand side menu, click My Downloads.
	3. In the search bar in the upper right side of the page enter "VMware vSphere"
	4. Choose VMware vSphere
	5. Under **Products** tab, select VMware VSphere Enterprise and appropriate version.
	6. Click View Group on the right side of the VMware tools item. 
	7. Use the drop-down in the upper-right to choose the desired version. 
		1. Download the offline bundle - `VMware Tools Offline VIB Bundle`
2. Upload VIB package to Lifecycle manager 
	1. Click actions > Import updates
	2. Select vib zip file
3. After upload is completed, create a new baseline with both esxi host and vmware tools, or,
	1. Create different packages.
	2. Create content type - patch
	3. select patches manually - vmwtools - appropriate esxi version
4. This does not require reboot

Other ways:
1. Create a common repository with whatever version you want to maintain
	1. This requires a common datastore to be accessible to all hosts, which might not be possible
2. Using images in VMware Lifecycle management
	1. Needs all hosts to be the same hardware, etc.

---
# references:
[Options for Updating VMware Tools at Scale - VMware Cloud Foundation (VCF) Blog](https://blogs.vmware.com/cloud-foundation/2023/03/07/options-for-updating-vmware-tools-at-scale/#:~:text=Because%20VMware%20Tools%20are%20available,for%20silent%20installation%20as%20well.)