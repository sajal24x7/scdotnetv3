---
title: "How to Delete Multipass Vms"
slug: "how-to-delete-multipass-vms"
created: 2026-08-23T14:22:00+03:00
updated: 2026-08-23T14:25:16+03:00
category: til
tags: ["linux", "multipass"]
---
```bash
# Delete primary vm
multipass delete primary

# List vms
multipass list

Name                    State             IPv4             Image

primary                 Deleted           --               Ubuntu 26.04 LTS

devops-vm               Running           192.168.252.2    Ubuntu 26.04 LTS

# Purge to permanently delete deleted instances

multipass purge

multipass list 

Name                    State             IPv4             Image

devops-vm               Running           192.168.252.2    Ubuntu 26.04 LTS
```


```learn
Q: How to delete multipass VMs?
A: multipass delete vm-name

Q: How to permanently delete deleted VMs?
A: multipass purge
```