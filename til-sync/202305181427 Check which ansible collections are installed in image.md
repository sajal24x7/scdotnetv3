---
aliases:
  - Check which ansible collections are installed in image
tags:
  - "#ansible"
category: til
updated: 2026-08-25T14:30:56
---
```bash
# From one of the controller system:
podman run -it --rm registry.redhat.io/ansible-automation-platform-21/ee-supported-rhel8 ansible-galaxy collection list
```

---
# references:
[What all certified collections are included in the Execution Environments(EE's) provided by Ansible Automation Platform 2.x? - Red Hat Customer Portal](https://access.redhat.com/solutions/6844291)