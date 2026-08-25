---
aliases:
  - Sector
  - Sector size
tags:
  - "#windows"
  - "#storage"
category: til
updated: 2026-08-25T14:30:56
---
# Sector
- Minimum amount of data that can be read or written to HD
- Traditionally 512Bytes, now different options are there
- Optimal sector size should be used
	- example if database that writes 8,192-byte records, then sector size should be configured as 8KB, so that complete entries are written in one allocation unit 
	- If size is 4 KB then record gets split

---
# references: