---
aliases:
  - Azure Compute Gallery
tags:
  - "#azure"
  - "#compute"
category: til
updated: 2026-08-25T14:30:56
---
Azure Compute Gallery allows to store images and VM apps. 

It allows for 
1. Replication (to other regions, subscriptions, etc.)
2. Versioning (specify a source,)
	1. Some services in Azure see that a new version is available and they auto-update.

Images and VM apps both have 
- a definition which tells it what source to use.
- a version which is what is used when running install/creating a vm
In case of images source can be a shutoff VM, an image from marketplace, etc.
In case of VM app, it is packages kept on a blob somewhere + commands to install and uninstall, update, etc.

---
# references:
[John's VM course](https://www.youtube.com/watch?v=OykMc6wKMJY&list=PLlVtbbG169nGlGPWs9xaLKT1KfwqREHbs&index=22)
[Compute Gallery Overview](https://learn.microsoft.com/en-gb/azure/virtual-machines/shared-image-galleries?tabs=vmsource%2Cazure-cli)