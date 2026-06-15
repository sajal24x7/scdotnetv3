---
title: How to Check Ldaps Is Working or Not - Ldp.exe
slug: how-to-check-ldaps-is-working-or-not---ldp.exe
created: '2023-11-06T12:52:00+03:00'
updated: '2023-11-06T12:52:00+03:00'
category: til
tags:
  - windows
  - ad
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754756191106193'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkw5afqm2m'
---


1. Run ldp.exe
2. Connect > 
	1. give dc fqdn
	2. port = 636
	3. select ssl
3. Bind >
	1. Give user details
4. If connect is OK, then things are OK.

---
# references:
[Which Certificate is my Domain Controller using for LDAPS? - Mostly Technical (torivar.com)](https://www.torivar.com/2016/04/08/which-certificate-is-my-domain-controller-using-for-ldaps/)
