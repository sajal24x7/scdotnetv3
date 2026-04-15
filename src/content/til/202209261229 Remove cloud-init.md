---
title: Remove cloud-init
slug: remove-cloud-init
pubDate: '2022-09-26T12:29:00+03:00'
updatedDate: '2022-09-26T12:29:00+03:00'
category: til
tags: []
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