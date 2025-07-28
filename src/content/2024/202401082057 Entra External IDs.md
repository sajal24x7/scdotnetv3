---
title: Entra External IDs
slug: entra-external-ids
pubDate: '2024-01-08T20:57:00+03:00'
updatedDate: '2024-01-08T20:57:00+03:00'
category: til
tags:
- azure
- entra
---

- AuthN happens in guest [[202408281918 Entra ID tenant|tenant]]
- But AuthZ happens in my [[202408281918 Entra ID tenant|tenant]]
- User type will be guest
- Cross tenant access settings control on collaboration and inbound mfa trust
- User flow can be designed/ask for things at the time of signup
- Licensing is based on MAU (Monthly Active Users) - first 50,000 free
- To bulk add CSV requires email address and redirection url
# B2B Collaboration
- Actually creating a guest account in your tenant
- User can use their own credentials and use it to access resources in our tenant
- Invite External User option
# B2B Direct connect 
- Content can only be shared as Teams shared channels.
- Between 3 entra IDs on Azure
# B2C
- create separate AAD of type B2C
- They are my customers
- maybe they have their own id and we don't want to use new 
- or they can create their ID in this AAD/local account

---
# references
https://learn.microsoft.com/en-gb/entra/external-id/external-identities-pricing