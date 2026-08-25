---
aliases:
  - VMware remove host from inventory
tags:
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
---
1. Put host in maintenance mode.
2. Remove the host from distributed switch
3. Right-click the appropriate host in the inventory pane, and select Remove from Inventory from the pop-up menu

Step 2 might cause issues. 
[Unable to Remove a Host from a vSphere Distributed Switch (vmware.com)](https://docs.vmware.com/en/VMware-vSphere/6.5/com.vmware.vsphere.troubleshooting.doc/GUID-038AC93F-D710-48ED-8E3B-258A23FB2930.html)
[The resource 'Port-ID' is in use error when removing a host from VDS (2015435) (vmware.com)](https://kb.vmware.com/s/article/2015435)
Better to just Right click the ESXi host from the **Inventory** and select **Connection** > **Disconnect**
And after host is disconnected remove from inventory will remove it.

---
references:
[Remove a Host from vCenter Server (vmware.com)](https://docs.vmware.com/en/VMware-vSphere/6.7/com.vmware.vsphere.vcenterhost.doc/GUID-C88D843A-DB67-4888-9C36-8B72335EF3F8.html)