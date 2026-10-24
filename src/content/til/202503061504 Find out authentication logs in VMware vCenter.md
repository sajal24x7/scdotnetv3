---
title: "Find Out Authentication Logs in VMware VCenter"
slug: "find-out-authentication-logs-in-vmware-vcenter"
created: 2025-03-06T15:04:00+02:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["vmware"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoctfgmw23'
  - 'https://mastodon.social/@sajal24x7/116756404793473137'
---
Related to [VMware Logs](/til/vmware-logs)

1. Log in to vCenter appliance.
2. Go to /var/log/vmware/applmgmt-audit.
3. Check the lgos.
```ssh
cat applmgmt-audit.log | grep -i <username>
```

---
# references:
[Diagnosing Account Permission Issues in vCenter Server Using Log Analysis](https://knowledge.broadcom.com/external/article/372454/diagnosing-account-permission-issues-in.html)