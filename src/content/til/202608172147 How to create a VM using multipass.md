---
title: "How to Create a VM Using Multipass"
slug: "how-to-create-a-vm-using-multipass"
created: 2026-08-17T21:47:00+03:00
updated: 2026-08-17T22:06:18+03:00
category: til
tags: ["multipass", "compute", "ubuntu"]
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