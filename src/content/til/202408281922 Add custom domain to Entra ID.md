---
title: Add Custom Domain to Entra ID
slug: add-custom-domain-to-entra-id
created: '2024-08-28T19:22:00+03:00'
updated: '2024-08-28T19:22:00+03:00'
category: til
tags:
- entra
- azure
---

1. Have a custom domain registered with a registrar
2. Add a custom domain in [[202404011327 Entra ID|Entra ID]]
3. Create a custom record with the registrar 
	1. Entra only supports MX or TXT records
	2. Also useful for [[202407271215 Create Azure DNS zone and records|Create Azure DNS zone and records]]/[[202404141450 Azure DNS|Azure DNS]]
4. After the above is done, come back to [[202404011327 Entra ID|Entra ID]] and verify

---
# references:
[Add custom Domain](https://learn.microsoft.com/en-us/entra/fundamentals/add-custom-domain)