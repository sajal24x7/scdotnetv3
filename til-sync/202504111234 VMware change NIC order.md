---
tags:
  - cisco
  - vmware
aliases:
  - VMware change NIC order
category: til
updated: 2026-08-25T14:30:56
---
There is a bug in Cisco Hardware which causes vmnics to get assigned in wrong order after esxi install. As a workaround we can change the vmnic order from esxi level.

1. `localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias list` 
2. `esxcfg-nics -l` --> check the mac addresses, figure out which vmnic should have which mac
3. `localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias store --alias vmnic1 --bus-address s00000001:03.01 --bus-type pci` -  update physical alias.
4. `localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias store --bus-type logical --alias vmnic1 --bus-address "pci#s00000001:03.01#0"` - update logical address
5. Reboot the ESXi

```bash
[root@FIESOPLPRTESX13:~] localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias list
Bus type  Bus address            Alias
--------  ---------------------  -----
pci       p0000:67:00.1          vmnic2
pci       s00000001:03.02        vmhba2
pci       p0000:00:11.5          vmhba0
pci       p0000:67:00.0          vmnic1
pci       s00000001:03.00        vmnic0
pci       p0000:67:00.2          vmhba1
pci       s00000001:03.01        vmnic3
logical   pci#p0000:00:11.5#0    vmhba0
logical   pci#s00000001:03.01#0  vmnic3
logical   pci#s00000001:03.02#0  vmhba2
logical   pci#p0000:67:00.0#0    vmnic1
logical   pci#p0000:67:00.1#0    vmnic2
logical   pci#s00000001:03.00#0  vmnic0
logical   pci#p0000:67:00.2#0    vmhba1


[root@FIESOPLPRTESX13:~] esxcfg-nics -l
Name    PCI          Driver      Link Speed      Duplex MAC Address       MTU    Description
vmnic0  0000:62:00.0 nenic       Up   40000Mbps  Full   00:25:b5:01:00:fe 1500   Cisco Systems Inc Cisco VIC Ethernet NIC
vmnic1  0000:67:00.0 nenic       Up   40000Mbps  Full   00:25:b5:01:00:9b 1500   Cisco Systems Inc Cisco VIC Ethernet NIC
vmnic2  0000:67:00.1 nenic       Up   40000Mbps  Full   00:25:b5:01:00:6b 1500   Cisco Systems Inc Cisco VIC Ethernet NIC
vmnic3  0000:62:00.1 nenic       Up   40000Mbps  Full   00:25:b5:01:00:de 1500   Cisco Systems Inc Cisco VIC Ethernet NIC


vmnic1 --> vmnic3
vmnic2 --> vmnic1
vmnic3 --> vmnic2

localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias store --alias vmnic1 --bus-address s00000001:03.01 --bus-type pci
localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias store --alias vmnic2 --bus-address p0000:67:00.0 --bus-type pci
localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias store --alias vmnic3 --bus-address p0000:67:00.1 --bus-type pci


localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias store --bus-type logical --alias vmnic1 --bus-address "pci#s00000001:03.01#0"
localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias store --bus-type logical --alias vmnic2 --bus-address "pci#p0000:67:00.0#0"
localcli --plugin-dir /usr/lib/vmware/esxcli/int/ deviceInternal alias store --bus-type logical --alias vmnic3 --bus-address "pci#p0000:67:00.1#0"
```

---
# references:
[How VMware ESXi determines the order in which names are assigned to devices](https://knowledge.broadcom.com/external/article/324534/how-vmware-esxi-determines-the-order-in.html)