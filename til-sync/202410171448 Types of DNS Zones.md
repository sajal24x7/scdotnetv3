---
aliases:
  - Types of DNS Zones
  - dns zones
tags:
  - "#windows"
  - "#dns"
category: til
updated: 2026-08-25T14:30:56
---
1. Primary Zone
	1. R/W container
	2. Standard and AD-Integrated
	3. Only zones which can be edited
2. Secondary Zone
	1. Keeps a RO copy of a primary zone
3. Stub Zone
	1. RO copy of master zone but contains only NS and SOA [[202410171442 Types of DNS records|dns records]]
	2. Not a replacement of secondary zone
	3. Different from [[202410171455 Conditional Forwarders|conditional forwarders]]
4. Reverse Lookup Zone
	1. Contains PTR [[202410171442 Types of DNS records|dns records]]

---
# references: