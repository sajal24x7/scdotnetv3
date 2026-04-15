---
title: How to check ldaps is working or not - ldp.exe
slug: how-to-check-ldaps-is-working-or-not---ldp.exe
pubDate: '2023-11-06T12:52:00+03:00'
updatedDate: '2023-11-06T12:52:00+03:00'
category: til
tags:
- windows
- ad
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