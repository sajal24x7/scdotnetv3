---
title: Ansible VMware Module Does Sysprep by Default
slug: ansible-vmware-module-does-sysprep-by-default
created: '2024-05-28T15:30:00+03:00'
updated: '2024-05-28T15:30:00+03:00'
category: til
tags:
- ansible
- windows
- vmware
---

When using [community.vmware.vmware_guest module – Manages virtual machines in vCenter — Ansible Community Documentation](https://docs.ansible.com/ansible/latest/collections/community/vmware/vmware_guest_module.html) 
- It uses syprep by default when it recognises it is a windows image

This is an issue because after running [[202209261330 Windows sysprep reference|Sysprep]] we need to relogin to set things like time zone, etc.

---
# references:
[community.vmware.vmware_guest module – Manages virtual machines in vCenter — Ansible Community Documentation](https://docs.ansible.com/ansible/latest/collections/community/vmware/vmware_guest_module.html)
> - Uses SysPrep for Windows VM (depends on ‘guest_id’ parameter match ‘win’) with PyVmomi.


