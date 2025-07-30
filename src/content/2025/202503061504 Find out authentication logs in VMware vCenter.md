---
title: "Find out authentication logs in VMware vCenter"
slug: "find-out-authentication-logs-in-vmware-vcenter"
pubDate: 2025-03-06T15:41:09+03:00
updatedDate: 2025-03-06T15:41:09+03:00
category: til
tags:
  - "#vmware"

---
Related to [202303211323 VMware logs](#)

1. Log in to vCenter appliance.
2. Go to /var/log/vmware/applmgmt-audit.
3. Check the lgos.
```ssh
cat applmgmt-audit.log | grep -i <username>
```

---
# references:
[Diagnosing Account Permission Issues in vCenter Server Using Log Analysis](https://knowledge.broadcom.com/external/article/372454/diagnosing-account-permission-issues-in.html)