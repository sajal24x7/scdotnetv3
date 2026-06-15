---
title: Conditional Access
slug: conditional-access
created: '2024-04-01T15:57:00+03:00'
updated: '2024-04-01T15:57:00+03:00'
category: til
tags:
  - entra
  - azure
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754763970355875'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkzoaxca2m'
---

# How
1. Once authentication is done, Entra ID creates Refresh Token and Access Token. 
2. It sends RT and AT to user
3. User sends AT to App
4. ATs are time-bombed
5. After time is done, new RT and AT generated
6. If a new app requires authentication, user can use the same AT
7. Every ask for token goes through [[202404011557 Conditional Access|conditional access]]

# Overview
1. Allows you to set conditions for access
	1. device
	2. location
	3. apps
2. Access controls (make multiple selections)
	1. use MFA, FIDO2, etc.
	2. password policy etc
3. Session controls
	1. continuous access evaluation
	2. cap


---
# references:
