---
title: How to Create a VM Using Multipass
slug: how-to-create-a-vm-using-multipass
created: 2026-08-17T18:47:00.000Z
updated: 2026-08-17T19:06:18.000Z
category: til
tags:
  - multipass
  - compute
  - ubuntu
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117113010770725748'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mtcnzhjuj42o'
  - 'https://www.threads.com/@sajal24x7/post/DcKBc1AoBef'
---
```bash

## Create a default ubuntu vm
## Default config is 1 cpu 1 GB RAM and 5 GB disk
multipass launch --name "vm-name"

## To list instances
multipass list

## To open shell to primary vm
multipass shell

## To open shell to specific vm
multipass shell "vm-name"

```


```learn
Q: How to create VM using multipass with default configurations?
A: multipass launch --name "vm-name"
```
