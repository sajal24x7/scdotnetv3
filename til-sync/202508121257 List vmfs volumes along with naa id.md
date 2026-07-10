---
tags:
  - vmware
  - esxi
  - esxcli
aliases:
  - List vmfs volumes along with naa id
category: til
---
This commands lists naa id, vmfs id and datastore name. We can grep to search for a particular vmfs volume.

``` esxcli
esxcli storage vmfs extent list
```

---
# references: