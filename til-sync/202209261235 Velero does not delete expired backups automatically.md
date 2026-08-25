---
aliases:
  - Velero does not delete expired backups automatically
tags:
  - "#velero"
category: til
updated: 2026-08-25T14:30:56
---
When scheduled backup reach their TTL, the deletion process is started but gets stuck in status `Deleting`. The contents are properly deleted, while volume snapshots stay (causing space issue).
To manually delete backups that are stuck in Deleting state:

``` bash

kubectl delete backups.velero.io -n velero <backup_name>

```

---
references:
1. [Github](https://github.com/vmware-tanzu/velero/issues/3094)
2. [Github](https://github.com/vmware-tanzu/velero/pull/2993)