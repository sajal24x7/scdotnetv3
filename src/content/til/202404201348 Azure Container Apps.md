---
title: Azure Container Apps
slug: azure-container-apps
created: '2024-04-20T13:48:00+03:00'
updated: '2024-04-20T13:48:00+03:00'
category: til
tags:
- azure
- appservices
- container
---

- Built on top of [[202404201210 Azure Kubernetes Service|AKS]], abstracts away the AKS layer. We focus on the application
- Brings envoy, dapr, keda
	- Dapr - Distributed Application Runtime
		- Event drivent runtime
		- Runs a sidecar container
		- basically an api that can be used by our app to call any dapper component
	- KEDA - Kubernetes Event Driven Autoscale
- Built-in AuthN and AuthZ
	- Restrict Access setting to control
- Versioning using revisions
	- which is immutable snapshot of container app version
- You can set environment variables and secrets
	- Secrets once defined at app level are available in containers as environment variables

# Container Apps Environment
- individual apps deployed to app environment which acts as security boundary
- Apps deployed in the same environment are deployed to same [[202404121703 Azure VNet|VNet]]  and write logs to the same log analytics workspace.

---
# references:
[Dapr overview](https://docs.dapr.io/concepts/overview/)
https://learn.microsoft.com/en-us/azure/container-apps/ingress-overview?tabs=bash
https://learn.microsoft.com/en-us/azure/container-apps/overview
[MS Learn](https://learn.microsoft.com/en-in/training/modules/implement-azure-container-apps/2-explore-azure-container-apps)