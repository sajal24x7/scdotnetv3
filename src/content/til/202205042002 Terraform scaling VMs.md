---
title: Terraform Scaling VMs
slug: terraform-scaling-vms
pubDate: '2022-05-04T20:02:00+03:00'
updatedDate: '2022-05-04T20:02:00+03:00'
category: til
tags:
- terraform
---


1. Define a var file with a list of objects, e.g. VMname, cpu, etc.
2. Define resource block for VM.
3. Upon apply, VMs are deployed in an order like : web[0], web[1], web[2]
![[Pasted image 20220504200506.png]]
4. You can scale up/down from the end, i.e. specify web[3], web[4]. But removal will be LIFO, so web[4], web[3] and so on.

---
references: