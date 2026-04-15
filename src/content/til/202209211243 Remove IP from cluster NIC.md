---
title: Remove IP from cluster NIC
slug: remove-ip-from-cluster-nic
pubDate: '2022-09-21T12:43:00+03:00'
updatedDate: '2022-09-21T12:43:00+03:00'
category: til
tags: []
---


To remove IP from the microsoft cluster nic

``` cmd
netsh interface ip set address “Local Area Connection” dhcp
```

---
references: