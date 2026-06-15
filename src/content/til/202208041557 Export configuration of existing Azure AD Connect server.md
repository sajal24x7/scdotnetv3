---
title: Export Configuration of Existing Azure AD Connect Server
slug: export-configuration-of-existing-azure-ad-connect-server
created: '2022-08-04T15:57:00+03:00'
updated: '2022-08-04T15:57:00+03:00'
category: til
tags:
- aadconnect
- azure
- entra
- entraconnect
---


Open the Azure AD Connect tool, and select the additional task named View or Export Current Configuration.
By default, the settings are exported to %ProgramData%\AADConnect.
Settings are exported by using the JSON file format and should not be hand-created or edited to ensure logical consistency.

---
references:
[How to import and export Azure AD Connect configuration settings - Microsoft Entra | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-import-export-config)