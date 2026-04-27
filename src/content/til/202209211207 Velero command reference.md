---
title: Velero Command Reference
slug: velero-command-reference
pubDate: '2022-09-21T12:07:00+03:00'
updatedDate: '2022-09-21T12:07:00+03:00'
category: til
tags:
- velero
- ccs
---


# Create backup schedule

14 days = 336 hrs
10 days = 240 hrs
07 days = 168 hrs

``` bash
velero schedule create ccs-prod --schedule="@every 24h" --include-namespaces=cisco --ttl 192h0m0s
```

# Velero backup list

``` bash
velero backup get
```

# Velero take backup

``` bash
velero backup create backup-20210819 --include-namespaces=cisco --wait --ttl 48h0m0s
```

# Delete backup

```bash

velero backup delete [backup_name]

```

---
references: