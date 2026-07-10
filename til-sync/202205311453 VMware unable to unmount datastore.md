---
tags:
  - vmware
aliases:
---

Error
> The resource '0200fe0000624a9370f25b6296a38b4191000d2851466c61736841' is in use.

# logdir is present
Go to Manage -> Settings -> Advanced System Settings. Find ScratchConfig.CurrentScratchLocation and Syslog.global.logDir\
If these mention datastores, change that.

# vCLS VMs are present
1. Go to the cluster
2. Under Configure >  **vSphere Cluster Services**, select **General**
3. click on **EDIT VCLS MODE**
4. 6. In the Edit vCLS Mode pop up window, click on the second radio option **Retreat Mode**.


## Through CLI

### Find the UUID for datastore to be removed.
```ssh
esxcli storage filesystem list

```

### Unmount
```ssh
esxcli storage filesystem unmount [-u _UUID_ | -l _label_ | -p _path_ ]
```

**Note**: If the VMFS filesystem you are attempting to unmount has active I/O or has not fulfilled the prerequisites to unmount the VMFS datastore, you see an error in the VMkernel logs similar to:  
  
WARNING: VC: 637: unmounting opened volume ('4e414917-a8d75514-6bae-0019b9f1ecf4' 'LUN01') is not allowed.  
VC: 802: Unmount VMFS volume f530 28 2 4e414917a8d7551419006bae f4ecf19b 4 1 0 0 0 0 0 : Busy

## verify that the datastore is unmounted, run this command:  
```ssh
esxcli storage filesystem list
```


---
references:
1. [How to detach a LUN device from ESXi hosts (2004605) (vmware.com)](https://kb.vmware.com/s/article/2004605)
2. [Steps to fix unable to unmount/delete VMFS Datastore: the resource is in use (bobcares.com)](https://bobcares.com/blog/steps-to-fix-unable-to-unmount-delete-vmfs-datastore-the-resource-is-in-use/)
3. [How to Disable vCLS on a Cluster via Retreat Mode (91890) (vmware.com)](https://kb.vmware.com/s/article/91890)