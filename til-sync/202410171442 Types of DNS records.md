---
aliases:
  - Types of DNS records
  - dns records
tags:
  - "#windows"
  - "#dns"
category: til
updated: 2026-08-25T14:30:56
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