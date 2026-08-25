---
title: How to Delete Multipass Vms
slug: how-to-delete-multipass-vms
created: 2026-08-23T11:22:00.000Z
updated: 2026-08-23T11:25:16.000Z
category: til
tags:
  - linux
  - multipass
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117146969479707307'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mtrqm3obgh26'
  - 'https://www.threads.com/@sajal24x7/post/DcZdx3EiTRT'
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
