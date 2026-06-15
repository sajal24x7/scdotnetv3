---
title: Velero Does Not Delete Expired Backups Automatically
slug: velero-does-not-delete-expired-backups-automatically
created: '2022-09-26T12:35:00+03:00'
updated: '2022-09-26T12:35:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modk7vtn2p2p'
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
