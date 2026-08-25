---
aliases:
  - Type of Databases
  - Azure databases
tags:
  - "#azure"
  - "#database"
category: til
updated: 2026-08-25T14:30:56
---
# OLTP
- Transactional processing
- Need to update what is happening
- High volume of small transactions
- Fast access
- Normalised DB 
	- De-duplication
	- Other things, basically things need to fit in a table
- [[202404271400 ACID|ACID]]

# OLAP
- Analytical Processing
- Large data volume
- Historical data
- Mainly read only
- [[202404261931 Azure Data warehouse and analytics]]

---
# references: