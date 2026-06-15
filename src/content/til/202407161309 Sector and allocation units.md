---
title: Sector and Allocation Units
slug: sector-and-allocation-units
created: '2024-07-16T13:09:00+03:00'
updated: '2024-07-16T13:09:00+03:00'
category: til
tags:
- windows
- storage
---

# Sector
- Minimum amount of data that can be read or written to HD
- Traditionally 512Bytes, now different options are there
- Optimal sector size should be used
	- example if database that writes 8,192-byte records, then sector size should be configured as 8KB, so that complete entries are written in one allocation unit 
	- If size is 4 KB then record gets split

---
# references: