---
title: "List Vmfs Volumes Along With Naa Id"
slug: "list-vmfs-volumes-along-with-naa-id"
pubDate: 2025-08-12T12:57:30+03:00
updatedDate: 2025-08-12T12:57:30+03:00
category: til
tags:
  - vmware
  - esxi
  - esxcli

---
This commands lists naa id, vmfs id and datastore name. We can grep to search for a particular vmfs volume.

``` esxcli
esxcli storage vmfs extent list
```

---
# references: