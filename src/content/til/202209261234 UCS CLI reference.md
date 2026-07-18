---
title: UCS CLI Reference
slug: ucs-cli-reference
created: '2022-09-26T12:34:00+03:00'
updated: '2022-09-26T12:34:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modk7llsy32m'
---


# Ucs Cheatsheet
```bash
show interface trunk
show service-profile circuit server 3/3
```


## UCS nxos/network/troubleshooting
```bash
connect nxos

# show npv flogi-table

# show mac address-table

```
# UCS NIC related

```
## For overview
# show interface brief


## For particular interface status

# show interface fc1/2

## To check utilization

Shows if anything is on the interface which has issue
# show npv flogi-table
--------------------------------------------------------------------------------
SERVER                                                                  EXTERNAL
INTERFACE VSAN FCID             PORT NAME               NODE NAME       INTERFACE
--------------------------------------------------------------------------------
vfc711    1    0x15070e 20:00:00:25:b5:01:b0:8f 20:00:00:25:b5:01:00:ff fc1/4
vfc747    1    0x150601 20:00:00:25:b5:01:b0:0f 20:00:00:25:b5:01:00:6f fc1/3
vfc753    1    0x150402 20:00:00:25:b5:01:b0:2f 20:00:00:25:b5:01:00:8f fc1/1
vfc759    1    0x15043b 20:00:00:25:b5:01:b0:1f 20:00:00:25:b5:01:00:7f fc1/1
vfc815    1    0x15043d 20:00:00:25:b5:01:b0:6f 20:00:00:25:b5:01:00:ef fc1/1
vfc821    1    0x150710 20:00:00:25:b5:01:b0:7f 20:00:00:25:b5:01:00:bf fc1/4
vfc827    1    0x150705 20:00:00:25:b5:01:b0:ff 20:00:00:25:b5:01:00:4f fc1/4
vfc839    1    0x150704 20:00:00:25:b5:01:b0:ef 20:00:00:25:b5:01:00:2f fc1/4


```
  
---
references:
