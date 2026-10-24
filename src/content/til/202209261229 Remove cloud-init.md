---
title: "Remove Cloud-init"
slug: "remove-cloud-init"
created: 2022-09-26T12:29:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["linux"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modk6j776d2v'
  - 'https://www.threads.com/@sajal24x7/post/DZnFXQ3Fqzt'
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