---
title: Entra ID Managed Identities
slug: entra-id-managed-identities
created: '2023-12-23T14:41:00+03:00'
updated: '2023-12-23T14:41:00+03:00'
category: til
tags:
  - azure
  - entra
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754757563751321'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkwrblh52m'
---


Provides identity for a resource which is hosted on [[202312231415 Azure Master|"Azure"]], when compared against [[202312231440 Azure Entra ID App Identity]] which can be used for both on-prem and azure.
Authentication is managed by [[202312231415 Azure Master|"Azure"]].

Two types:
- System-Assigned: for a single resource, as long as it is in use. If resource is deleted, identity is gone.
- user-assigned: can be shared between different resources. created by you. Deleting the resource does not delete the identity. one UAMI can be added to multiple resources. Also one resource can have many UAMI.
	- Example - farm of web servers can have on UAMI. Give permission to this UAMI once and it will have permission for all resources.

# Benefits
Here are some of the benefits of using managed identities:
- You don't need to manage credentials. Credentials aren’t even accessible to you.
- You can use [[202312231441 Entra ID Managed Identities|Managed Identity]] to authenticate to any resource that supports [Microsoft Entra authentication](https://learn.microsoft.com/en-in/entra/identity/authentication/overview-authentication), including your own applications.
- Managed identities can be used at no extra cost.
# Why?
Resource hosted in [[202312231415 Azure Master|"Azure"]] needs to talk to other stuff in [[202312231415 Azure Master|"Azure"]]. Application needs identity to have roles applied to itself so that it can access other resources. 
## Traditionally
When we do app registration, it creates a service principal for it in the same tenant. Once SP is there it can use secret, cert-based, etc to authenticate. Challenge is how to store it, etc.

## Managed Identity
We can add a [[202312231441 Entra ID Managed Identities|Managed Identity]] for an app. There is no secret, nothing that I have to worry about storing. [[202312231441 Entra ID Managed Identities|MI]] can only exist in the tenant it is created.  

### How is [[202312231441 Entra ID Managed Identities|MI]] managed
Managed Identity Resource Provider manages [[202312231441 Entra ID Managed Identities|MI]]. MIRP issues the cert and rolls the cert.

1. If a resource has System assigned [[202312231441 Entra ID Managed Identities|MI]] it will always use it to authenticate
2. If a resource has no SA-MI but only 1 UA-MI it will use that UA-MI to authenticate
3. If a resource has no SA-MI but multiple UA-MI, we need to specify which one it will use to authenticate

### How resource gets token
For a VM,
1. VM talks to Instance Meta Data Service, I need a token.
2. IMDS talks to MIRP
3. MIRP gives SP + Cert for the [[202312231441 Entra ID Managed Identities|MI]]
4. IMDS goes to AAD, and asks for token.
5. [[202404011327 Entra ID|AAD]] creates access token and sends it back to IMDS, which gives it to resource

Other services have similar methods. 

---
# references
https://www.youtube.com/watch?v=rC1TV0_sIrM&list=PLlVtbbG169nGlGPWs9xaLKT1KfwqREHbs&index=10
[MI overview](https://learn.microsoft.com/en-in/entra/identity/managed-identities-azure-resources/overview)
[Services that use MI](https://learn.microsoft.com/en-in/entra/identity/managed-identities-azure-resources/managed-identities-status)
[How MI works](https://learn.microsoft.com/en-in/entra/identity/managed-identities-azure-resources/how-managed-identities-work-vm)
[How to use MI token](https://learn.microsoft.com/en-in/entra/identity/managed-identities-azure-resources/how-to-use-vm-token)
