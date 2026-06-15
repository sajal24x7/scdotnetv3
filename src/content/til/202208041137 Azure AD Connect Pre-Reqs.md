---
title: Azure AD Connect Pre-Reqs
slug: azure-ad-connect-pre-reqs
created: '2022-08-04T11:37:00+03:00'
updated: '2022-08-04T11:37:00+03:00'
category: til
tags:
  - azure
  - entra
  - aadconnect
  - entraconnect
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modjypfjgx2w'
---


# Azure AD V2 pre-reqs
- An Azure AD tenant
- An **on-premises** or **cloud-hosted** (on an Infrastructure as a Service virtual machine) Windows Server running as an AD domain controller (older versions of Windows Server work but some features like password writeback will require 2016 or later)
-   Your **domain controller must be writable**, read-only domain controllers (RODC) are not supported
-   Ideally, **Azure AD Connect** should be installed on a dedicated domain-joined server, but you can also install it on your domain controller (Windows Server 2016 or later with Desktop Experience is required for Azure AD Connect V2)
-   **AD** and **AAD** **accounts** for your Azure AD Connect server. Microsoft differentiates accounts used for operating Azure AD Connect and those used for its installation and configuration.

# Install pre-reqs
- domain-joined Windows Server 2016 or later
- .Net Framework version required is 4.6.2, or newer
- Windows Server standard or better
- Azure AD Connect server must have a full GUI installed
- 

---
references:
[Azure AD Connect: Prerequisites and hardware - Microsoft Entra | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install-prerequisites)
