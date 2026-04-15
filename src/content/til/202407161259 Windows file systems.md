---
title: Windows file systems
slug: windows-file-systems
pubDate: '2024-07-16T12:59:00+03:00'
updatedDate: '2024-07-16T12:59:00+03:00'
category: til
tags:
- windows
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