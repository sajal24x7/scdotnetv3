---
aliases:
  - List vmfs volumes along with naa id
tags:
  - "#vmware"
  - "#esxi"
  - "#esxcli"
category: til
updated: 2026-08-25T14:30:56
---
This commands lists naa id, vmfs id and datastore name. We can grep to search for a particular vmfs volume.

``` esxcli
esxcli storage vmfs extent list
```

---
# references: