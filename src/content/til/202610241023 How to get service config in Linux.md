---
title: "How to Get Service Config in Linux"
slug: "how-to-get-service-config-in-linux"
created: 2026-10-24T10:23:00+03:00
updated: 2026-10-24T10:30:05+03:00
category: til
tags: ["linux", "service"]
---
1. Use systemctl

```bash
## all properties of the service
systemctl show kubelet | grep -i config

## show the unit file and any overrides
systemctl cat kubelet
```