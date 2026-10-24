---
title: "Add Custom Domain to Entra ID"
slug: "add-custom-domain-to-entra-id"
created: 2024-08-28T19:22:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["entra", "azure"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoaa3g4v23'
  - 'https://mastodon.social/@sajal24x7/116756211352252328'
---
1. Have a custom domain registered with a registrar
2. Add a custom domain in [Entra ID](/til/entra-id)
3. Create a custom record with the registrar 
	1. Entra only supports MX or TXT records
	2. Also useful for [Create Azure DNS zone and records](/til/create-azure-dns-zone-and-records)/[Azure DNS](/til/azure-dns)
4. After the above is done, come back to [Entra ID](/til/entra-id) and verify

---
# references:
[Add custom Domain](https://learn.microsoft.com/en-us/entra/fundamentals/add-custom-domain)