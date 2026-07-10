---
tags:
  - "#windows"
aliases:
  - Windows file system
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