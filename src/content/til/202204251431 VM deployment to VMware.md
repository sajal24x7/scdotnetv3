---
title: VM Deployment to VMware
slug: vm-deployment-to-vmware
created: '2022-04-25T14:31:00+03:00'
updated: '2022-04-25T14:31:00+03:00'
category: til
tags:
  - vmware
  - terraform
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhnevwjn2s'
---


# Disk
1. One of `datastore_id` or `datastore_cluster_id` must be specified.
2. Use of `datastore_cluster_id` requires vSphere Storage DRS to be enabled on the specified datastore cluster.
3. The `datastore_cluster_id` setting applies to the entire virtual machine resource. You cannot assign individual individual disks to datastore clusters. In addition, you cannot use the [`attach`](https://registry.terraform.io/providers/hashicorp/vsphere/latest/docs/resources/virtual_machine#attach) setting to attach external disks on virtual machines that are assigned to datastore clusters.

---
references:
1. [vsphere_virtual_machine | Resources | hashicorp/vsphere | Terraform Registry](https://registry.terraform.io/providers/hashicorp/vsphere/latest/docs/resources/virtual_machine)
