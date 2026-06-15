---
title: Types of DNS Records
slug: types-of-dns-records
created: '2024-10-17T14:42:00+03:00'
updated: '2024-10-17T14:42:00+03:00'
category: til
tags:
  - windows
  - dns
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modobobjv62z'
---

1. SOA (Start of Authority)
	1. Created when a zone is created
	2. Has settings like TTL, Primary server, responsible person, Expires after, etc
2. A and AAAA (Host)
	1. Map FQDN to IP address
3. NS records
	1. List all authoritative DNS servers for the zone
4. MX (Mail exchanger)
	1. Specify MX server (Exchange or o365)
5. CNAME (Canonical/Alias)
6. PTR (Pointer)
	1. IP to FQDN
7. SRV 
	1. Specify location of service
	2. Helps locate the nearest DC for example

---
# references:
