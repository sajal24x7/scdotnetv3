---
title: Check Which Ansible Collections Are Installed in Image
slug: check-which-ansible-collections-are-installed-in-image
created: '2023-05-18T14:27:00+03:00'
updated: '2023-05-18T14:27:00+03:00'
category: til
tags:
- ansible
---


```bash
# From one of the controller system:
podman run -it --rm registry.redhat.io/ansible-automation-platform-21/ee-supported-rhel8 ansible-galaxy collection list
```

---
# references:
[What all certified collections are included in the Execution Environments(EE's) provided by Ansible Automation Platform 2.x? - Red Hat Customer Portal](https://access.redhat.com/solutions/6844291)