---
aliases:
  - Download host metrics report from Ansible Automation Platform
tags:
  - "#ansible"
category: til
updated: 2026-08-25T14:30:56
---
```bash
# To get output in csv
awx-manage host_metric --csv

# To download a tarball
awx-manage host_metric --tarball


```

# API

https://taapservice.op-palvelut.fi/api/v2/host_metrics/?format=api&page_size=200

---
# references:

[Automation Controller User Guide Red Hat Ansible Automation Platform 2.4 | Red Hat Customer Portal](https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html-single/automation_controller_user_guide/index#controller-keep-subscription-in-compliance)