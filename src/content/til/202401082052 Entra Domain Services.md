---
title: Entra Domain Services
slug: entra-domain-services
created: '2024-01-08T20:52:00+03:00'
updated: '2024-01-08T20:52:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754759105436953'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkxhhcbk2z'
  - 'https://www.threads.com/@sajal24x7/post/DZnG9B3FixR'
---


Previously known as Azure AD DS.

To provide features that might be required for legacy on-prem applications, etc.

Entra ID is modern solution.

# Features
AD Domain join
AD Group policy
Legacy protocols (LDAP,kerberos/NTLM, etc)

# Key Components
- Managed domain (Managed by MSFT)
- Sync (one way sync from Entra ID)
- Virtual Network (Resources can only interact with managed domain through virtual network (same network or network which has access to this network where managed domain is deployed))

---
# references
