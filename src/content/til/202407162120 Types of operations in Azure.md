---
title: "Types of Operations in Azure"
slug: "types-of-operations-in-azure"
created: 2024-07-16T21:20:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754959914804395'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnsrz4iv2s'
---
- These are used elsewhere like in [azure governance](/til/governance-overview)
	- So in [RBAC](/til/azure-rbac) what [azure roles](/til/azure-roles) apply to which plane - control or data
	- Someone might not have access to manage a VM, but they might have access to login to the OS
# Control Plane
- To manage resource in [Azure](/til/azure-master)
- In [How to interact with Azure](/how-to-interact-with-azure), everything goes through [ARM](/til/azure-resources)
	- All requests go to a resource manager url
	- ARM knows what exists and what does not exist and does not create duplicate resources
# Data Plane
- To access features exposed by the [resource](/til/azure-resources)
- Requests go to specific endpoint for the Azure [resource](/til/azure-resources)



---
# references:
[Learn - ARM](https://learn.microsoft.com/en-in/training/modules/introduction-to-infrastructure-as-code-using-bicep/3-what-azure-resource-manager)