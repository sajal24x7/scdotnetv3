---
aliases:
  - Remove cloud-init
tags:
  - "#linux"
category: til
updated: 2026-08-25T14:30:56
---
# Remove-cloud-init

## Stop services

```bash
systemctl stop cloud-init.service
systemctl disable cloud-init.service
systemctl stop cloud-init-local.service
systemctl disable cloud-init-local.service
systemctl stop cloud-config.
systemctl stop cloud-config.service
systemctl disable cloud-config.service
systemctl stop cloud-final.service
systemctl disable cloud-final.service
```


## Remove cloud-init

```bash
### Find cloud-init pakage
rpm -qa | grep cloud-init

### Remove the package found in step above
rpm -e <cloud-init*>
```

---
references: