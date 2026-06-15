---
title: Azure Container Instance
slug: azure-container-instance
created: '2024-04-20T12:03:00+03:00'
updated: '2024-04-20T12:03:00+03:00'
category: til
tags:
  - azure
  - appservices
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754927485000433'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modne2333f2m'
---

- Basic container as service
- Can be windows or linux 
	- But some features are linux specific
- Can be useful for one-off things/burst
- Multi-container groups on same host
	- only for linux based containers
- Can be deployed in vNet
- can mount additional storage
	- azure file share

# Container group
- top level resource
- deployed on one VM
- containers in a group share same resources
- similar to pod in kubernetes
- Environment variables can be set with --environment-variables
	- passwords etc with secureValue
- when deploying multi-container groups
	- yaml for only containers
	- arm templates in case volumes need to be attached as well

```bash
az container create
```

```powershell

New-AzContainerGroup


```

---
# references:
[MS Learn](https://learn.microsoft.com/en-in/training/modules/create-run-container-images-azure-container-instances/2-azure-container-instances-overview)
