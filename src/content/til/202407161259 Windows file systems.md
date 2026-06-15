---
title: Windows File Systems
slug: windows-file-systems
created: '2024-07-16T12:59:00+03:00'
updated: '2024-07-16T12:59:00+03:00'
category: til
tags:
  - windows
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754958702026698'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnsaft4f2s'
---

# FAT
- FAT not larger than 4GB
- FAT32 not larger than 64GB
- exFAT for removable drives 

# NTFS
- supports ACL, encryption, etc.
- Formatting:
	- MBR (upto 2TB)
	- GPT

# ReFS
- Introduced with Server 2012
- Has enhanced resiliency to data corruption
- Not feature-parity with NTFS
- Not suitable for boot volumes and removable media

---
# references:
