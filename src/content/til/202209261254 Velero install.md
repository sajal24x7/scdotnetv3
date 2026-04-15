---
title: Velero install
slug: velero-install
pubDate: '2022-09-26T12:54:00+03:00'
updatedDate: '2022-09-26T12:54:00+03:00'
category: til
tags: []
---


# Fresh install

1. Extract the tarball.

```bash

tar -xvf velero-v1.6.0-linux-amd64.tar.gz

```

2. Move the velero* file from velero directory to /usr/local/bin/

```bash

mv velero /usr/local/bin/

```

3. Configure velero

Refer [compatibility matrix](https://github.com/vmware-tanzu/velero-plugin-for-aws) to figure out which version of plugin goes with which version of velero.

```bash

velero install --provider aws --bucket velero --secret-file ./credentials-velero  --use-volume-snapshots=false --backup-location-config region=minio,s3ForcePathStyle="true",s3Url=http://10.47.19.232:9000  --use-restic --plugins velero/velero-plugin-for-aws:v1.0.0 –wait

velero install --provider aws --bucket velero --secret-file ./credentials-velero  --use-volume-snapshots=false --backup-location-config region=minio,s3ForcePathStyle="true",s3Url=http://10.47.20.119:9000  --use-restic --plugins velero/velero-plugin-for-aws:v1.0.0 –wait

```

1. Check install Status

```bash

kubectl logs deployment/velero -n velero

```

5. Annotate pods.

```bash

python pod_vol_restic_scan.py -n cisco

```

6. Create backup.

```bash

velero backup create backup-20220621 --include-namespaces=cisco --wait --ttl 48h0m0s

```

7. List backups.

```bash

velero backup get

```

velero backup create backup-20220308 --include-namespaces=cisco --wait

velero restore create --from-backup <Minio backup>

# 04 Op Ccs Velero

## Create backup schedule

14 days = 336 hrs

10 days = 240 hrs

07 days = 168 hrs

``` bash

velero schedule create ccs-prod --schedule="@every 24h" --include-namespaces=cisco --ttl 192h0m0s

```

## Velero backup list

``` bash

velero backup get

```

## Velero take backup

``` bash

velero backup create backup-20210819 --include-namespaces=cisco --wait --ttl 48h0m0s

```

## Delete backup

```bash

velero backup delete [backup_name]

```

kubectl delete namespace/velero clusterrolebinding/velero

cp velero-v1.3.2-linux-amd64.tar.gz /home/restore/

tar -xvf velero-v1.3.2-linux-amd64.tar.gz

cd velero-v1.3.2-linux-amd64

mv velero /usr/local/bin/

velero install --provider aws --bucket velero --secret-file ./credentials-velero  --use-volume-snapshots=false --backup-location-config region=minio,s3ForcePathStyle="true",s3Url=http://10.47.20.119:9000  --use-restic --plugins velero/velero-plugin-for-aws:v1.0.0 –wait

---
references: