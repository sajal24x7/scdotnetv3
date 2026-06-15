---
title: "VMware Change NIC Order"
slug: "vmware-change-nic-order"
created: 2025-04-11T12:40:00+03:00
updated: 2025-04-11T12:40:00+03:00
category: til
tags:
  - "#cisco"
  - "#vmware"

---
There is a bug in Cisco Hardware which causes vmnics to get assigned in wrong order after esxi install. As a workaround we can change the vmnic order from esxi level.

1. `localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias list` 
2. `esxcfg-nics -l` --> check the mac addresses, figure out which vmnic should have which mac
3. `localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias store --alias vmnic1 --bus-address s00000001:03.01 --bus-type pci` -  update physical alias.
4. `localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias store --bus-type logical --alias vmnic1 --bus-address "pci#s00000001:03.01#0"` - update logical address

```bash
[root@FIESOPLPRTESX13:~] localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias list
Bus type  Bus address            Alias
--------  ---------------------  --# references:
[How VMware ESXi determines the order in which names are assigned to devices](https://knowledge.broadcom.com/external/article/324534/how-vmware-esxi-determines-the-order-in.html)