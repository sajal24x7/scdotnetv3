---
aliases:
  - Azure Container Instance
  - ACI
tags:
  - "#azure"
  - "#appservices"
category: til
updated: 2026-08-25T14:30:56
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