---
tags:
  - "#vmware"
aliases:
category: til
---
Related to [[202303211323 VMware logs]]

1. Log in to vCenter appliance.
2. Go to /var/log/vmware/applmgmt-audit.
3. Check the lgos.
```ssh
cat applmgmt-audit.log | grep -i <username>
```

---
# references:
[Diagnosing Account Permission Issues in vCenter Server Using Log Analysis](https://knowledge.broadcom.com/external/article/372454/diagnosing-account-permission-issues-in.html)