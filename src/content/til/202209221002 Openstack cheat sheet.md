---
title: Openstack Cheat Sheet
slug: openstack-cheat-sheet
created: '2022-09-22T10:02:00+03:00'
updated: '2022-09-22T10:02:00+03:00'
category: til
tags: []
---


# Openstack Cheat Sheet

## Volume
```bash
openstack volume create --size 25 --description 7OCIWPPOCAP01_DATA_DISK1 --type OP-ES-OPPT-T2 7OCIWPPOCAP01_DATA_DISK1

nova volume-attach 7OCIWPPOCAP01 58fdd51a-e3bc-4d80-983d-e8d9f2828094
```
 
## Compute

``` openstack
nova interface-list {hostname}
nova interface-detach {hostname} {port-id}
```

## Network

``` openstack
gbp group-list
openstack port list
openstack port delete {port-id}
openstack port show {port-id}
```

### Remove interface

``` openstack
nova interface-list 7OGBWPCENAP01
nova interface-detach 7OCIWPSWAPE16 8e4237df-9dec-4f59-9316-89a56ce97ddc
neutron port-delete 52a02dbb-36d8-4ac6-8042-28a48dd9a98a
nova interface-attach --port-id 93610a8b-4003-473f-a9b0-64e403f123e7 7OGBWPSAPAP02
```

### Reserve IPs

### epg-Trusted-Devops-Test

```openstack

gbp policy-target-create --policy-target-group epg-Trusted-Devops-Test --fixed-ip subnet_id=8996ed17-fff7-4742-84cb-b4466102cc4e,ip_address=10.45.59.252 SWIPAM_rsrvd_ip

  
  

```

  

### epg-Trusted-Devops-Prod

  

```openstack

gbp policy-target-create --policy-target-group epg-Trusted-Devops-Prod --fixed-ip subnet_id=f4861689-8893-4934-8662-9b1835581cd2,ip_address=10.45.59.252 SWIPAM_rsrvd_ip

  
  

gbp policy-target-create --policy-target-group epg-Trusted-Devops-Prod 7OGBWPMCIAP01_rsrvd_ip

nova interface-attach --port-id 03294e0d-3eb0-40da-a55b-d072459dd7e1 7OGBWPMCIAP01

nova interface-detach 7OGBWPMCIAP01 39beb2a3-93ec-441d-bfcd-84abfde63c44

neutron port-delete 39beb2a3-93ec-441d-bfcd-84abfde63c44

```

  

### epg-Heartbit-L2-Vlan-267

  

``` openstack

gbp policy-target-create --policy-target-group epg-Heartbit-L2-Vlan-267 --fixed-ip subnet_id=e2377dc9-9f69-462e-9e8f-0f60f7464cf1,ip_address=10.45.181.119 5OCIWTEXGAP02_rsrvd_ip

nova interface-attach --port-id fa474fa4-5955-41ec-9224-af544e337e3f 5OCIWTEXGAP02

gbp policy-target-create --policy-target-group epg-Heartbit-L2-Vlan-267 --fixed-ip subnet_id=e2377dc9-9f69-462e-9e8f-0f60f7464cf1,ip_address=10.45.181.120 7OCIWTEXGAP01_rsrvd_ip

nova interface-attach --port-id f1b00083-c2b3-4fc9-8b21-fa696c87393e 7OCIWTEXGAP01

```

  

#### epg-Audit-Zone

  

``` openstack

gbp policy-target-create --policy-target-group epg-Audit-Zone --fixed-ip subnet_id=76eedfa2-6362-4bae-9a0d-e334e196e4f2,ip_address=10.45.128.47 5OCILPBCTAP01_rsrvd_ip

gbp policy-target-create --policy-target-group epg-Audit-Zone --fixed-ip subnet_id=76eedfa2-6362-4bae-9a0d-e334e196e4f2,ip_address=10.45.128.48 5OCILPBCTAP02_rsrvd_ip

```

  

#### epg-OP-Trusted-Devops-Prod-VLAN3262

  

```bash

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=10.129.102.210

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

gbp policy-target-create --policy-target-group epg-OP-Trusted-Devops-Prod-VLAN3262 --fixed-ip subnet_id=c5c6c497-707f-4ca5-b18d-b47155c96c66,ip_address=

```

  
  
  

#### epg-OP-Trusted-Test2-VLAN3083

  

``` openstack

gbp policy-target-create --policy-target-group epg-OP-Trusted-Test2-VLAN3083 --fixed-ip subnet_id=5b943a39-0f06-4524-8253-eeee1a9dfcb2,ip_address=10.128.100.144 OGBWTAVACL01_rsrvd_ip

nova interface-attach --port-id cc615e5c-2558-4e0a-8225-58893988aa6b 7ogbwtdocap01

nova interface-detach 7ogbwtdocap01 58c53acd-135e-4dd8-a894-3112701b1630

neutron port-delete 58c53acd-135e-4dd8-a894-3112701b1630

```

  

#### epg-OP-Control-Zone

  

``` openstack

gbp policy-target-create --policy-target-group epg-OP-Control-Zone --fixed-ip subnet_id=2f04a7cb-c676-412b-9183-02122c8a4be8,ip_address=10.45.99.233 7oczlpecsap01_rsrvd_ip

```

  

#### epg-Trusted-FLT

  

``` openstack

gbp policy-target-create --tenant-id 0ecd949fad4f4c6781515574ea37ba18 --policy-target-group epg-Trusted-FLT --fixed-ip subnet_id=fb88cf28-91eb-400c-a10a-f04616e67346,ip_address=10.45.39.198 PRDISAM01_rsrvd_ip

```

  

#### epg-DMZ-FLT

  

``` openstack

gbp policy-target-create --tenant-id 0ecd949fad4f4c6781515574ea37ba18 --policy-target-group epg-DMZ-FLT --fixed-ip subnet_id=f2cecd7e-1bef-4610-82f9-307ec9a372ff,ip_address=10.45.4.150 7OGBLPIAMAP01_rsrvd_ip

```

  

#### epg-DMZ-Dev

  

``` openstack

gbp policy-target-create --tenant-id 0ecd949fad4f4c6781515574ea37ba18 --policy-target-group epg-DMZ-Dev --fixed-ip subnet_id=3686f7a3-7755-4d4f-80ce-2a5011ad735b,ip_address=10.45.23.201 5OGBLDIAMAP01_rsrvd_ip

```

  

#### epg-DMZ-Test 10.45.16.0/22

  

``` openstack

gbp policy-target-create --tenant-id 0ecd949fad4f4c6781515574ea37ba18 --policy-target-group epg-DMZ-Test --fixed-ip subnet_id=d1413a33-7a81-4563-a63f-fa0e0c9d4f02,ip_address=10.45.19.151 5OGBLTIAMAP01_rsrvd_ip

```

  

#### epg-trusted-test 10.45.48.0/22

  

``` openstack

gbp policy-target-create --policy-target-group epg-trusted-test --fixed-ip subnet_id=34c45edd-4e9b-4620-8efe-faef869aab9f,ip_address=10.45.51.235 OCIWTFTIFS01_rsrvd_ip

```

  

#### epg-trusted-test

  

``` openstack

gbp policy-target-create --tenant-id 0ecd949fad4f4c6781515574ea37ba18 --policy-target-group epg-trusted-test --fixed-ip subnet_id=0b3bf2dc-6d58-409e-8ece-ff36f4ade038,ip_address=10.45.244.234 MIFID2NTP03_rsrvd_ip

```

  

#### epg-Trusted-Dev

  

``` openstack

gbp policy-target-create --policy-target-group epg-Trusted-Dev --fixed-ip subnet_id=af8fcf51-42d4-455d-b3bb-061829db3652,ip_address=10.45.55.210 rhel79_rsrvd_ip

```

  

#### epg-OP-Trusted-FLT2-VLAN3100

  

``` openstack

gbp policy-target-create --policy-target-group epg-OP-Trusted-FLT2-VLAN3100 --fixed-ip subnet_id=8fea6f7f-b724-40ae-8fbd-f95f192c7fd1,ip_address=10.140.16.145 7ocilpmqaap01_rsrvd_ip

  

nova interface-attach --port-id cb8f7b39-fba8-4277-9d3d-10d6cded2a7d 7ogbwpft3ap01

nova interface-detach 7ogbwpft3ap01 97ddb931-3d4f-42fe-a34b-65094d21af8b

neutron port-delete 97ddb931-3d4f-42fe-a34b-65094d21af8b

  

```

  

#### epg-OP-FLT-Restricted-VLAN3225

  

``` openstack

gbp policy-target-create --tenant-id 0ecd949fad4f4c6781515574ea37ba18 --policy-target-group epg-OP-FLT-Restricted-VLAN3225 --fixed-ip subnet_id=667a81b0-67cb-40e6-b5ff-12cdf901d8a3,ip_address=10.128.175.156 7ocilpmdbdb01_gbpui

nova interface-attach --port-id 9381a2ce-09c9-4d90-a8a3-f07cbe772430 7ocilpmdbdb01

nova interface-detach 7ocilpmdbdb01 25dcba60-f09d-4bf9-92b9-2129fc51e4ca

neutron port-delete 25dcba60-f09d-4bf9-92b9-2129fc51e4ca

```

  

#### epg-OP-FLT-Trusted-VLAN3306

  

``` openstack

gbp policy-target-create --policy-target-group epg-OP-FLT-Trusted-VLAN3306 --fixed-ip subnet_id=c3f5b87d-c251-440b-9e9d-ab061686f398,ip_address=10.243.111.15 7OCILPHCPAP01_gbpui

```

  

#### epg-OP-Trusted-Tuki-VLAN3128

  

``` openstack

gbp policy-target-create --tenant-id 0ecd949fad4f4c6781515574ea37ba18 --policy-target-group epg-OP-Trusted-Tuki-VLAN3128 --fixed-ip subnet_id=97cd8e88-fd2f-4b26-81f3-cbcd2c49f0e1,ip_address=10.140.49.67 7OGBWPSAPAP02_gbpui

```

  

#### epg-OP-Trusted-Dev-VLAN3292

  

``` openstack

gbp policy-target-create --tenant-id 0ecd949fad4f4c6781515574ea37ba18 --policy-target-group epg-OP-Trusted-Dev-VLAN3292 --fixed-ip subnet_id=23ee9d7e-d711-4cbe-adce-e6c017853f12,ip_address=10.132.182.120 7ogbwddocap01_gbpui

nova interface-attach --port-id 7f603f40-79d4-491e-8846-62e251a6ed72 7ogbwddocap01

nova interface-detach 7ogbwddocap01 5e39b4a2-cb98-4273-b328-19c0a00bcc81

neutron port-delete 5e39b4a2-cb98-4273-b328-19c0a00bcc81

```

  

#### epg-Backup-Client

  

``` openstack

gbp policy-target-create --policy-target-group epg-Backup-Client 5OCIWPDLPAP01_gbpui

```

  

## Create Volume

  

``` openstack

openstack volume create --size 50 --description 5OCILISSAP02_DATA_DISK1 --type OP-HE-LOPTT-T2 5OCILISSAP02_DATA_DISK1

openstack server add volume 7OGBWPCENAP01 6a34d3fb-bb38-4092-8682-867c39319c8c

openstack volume show 6a34d3fb-bb38-4092-8682-867c39319c8c

```

---
references: