---
title: Find out Authentication Logs in VMware vCenter
slug: find-out-authentication-logs-in-vmware-vcenter
created: 2025-03-06T12:41:09.000Z
updated: 2025-03-06T12:41:09.000Z
category: til
tags:
  - '#vmware'
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoctfgmw23'
  - 'https://mastodon.social/@sajal24x7/116756404793473137'
---
Related to [202303211323 VMware logs](#)

1. Log in to vCenter appliance.
2. Go to /var/log/vmware/applmgmt-audit.
3. Check the lgos.
```bash
cat applmgmt-audit.log | grep -i <username>
```

---
# references:
[Diagnosing Account Permission Issues in vCenter Server Using Log Analysis](https://knowledge.broadcom.com/external/article/372454/diagnosing-account-permission-issues-in.html)
