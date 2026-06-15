---
title: Azure VM Basics
slug: azure-vm-basics
created: '2024-04-16T18:35:00+03:00'
updated: '2024-04-16T18:35:00+03:00'
category: til
tags:
- azure
- compute
---

1. IaaS service
	1. Everything inside the VM is our responsibility and under our control
		1. Things like patching, AV, etc.
2. Building block of lots of azure services
3. Different SKUs (based on ratio of CPU vs Memory)
	1. In a SKU different sizes (how much cpu and memory)
4. As physical hardware improves, different versions of virtual machines might come forward
	1. Different versions so that we have consistency, we can choose what we want to do.
5. VM needs to be Stopped (deallocated) for no charge. Shutting from guest does not de-provision it.

[[202404161906 How do we think about VM sizes or types on Azure|How do we think about VM sizes on Azure]]

# Commands
[[202407141333 Get Azure VM Images|Get Azure VM Images]]
[[202407141412 Create VM in Azure|Create VM in Azure]]

---
# references:
[John's YT](https://www.youtube.com/watch?v=OykMc6wKMJY&list=PLlVtbbG169nGlGPWs9xaLKT1KfwqREHbs&index=21)