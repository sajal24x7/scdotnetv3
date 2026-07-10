---
tags:
  - "#windows"
  - "#storage"
aliases:
  - Sector
  - Sector size
---
# Sector
- Minimum amount of data that can be read or written to HD
- Traditionally 512Bytes, now different options are there
- Optimal sector size should be used
	- example if database that writes 8,192-byte records, then sector size should be configured as 8KB, so that complete entries are written in one allocation unit 
	- If size is 4 KB then record gets split

---
# references: