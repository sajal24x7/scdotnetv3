---
title: "Type of Databases"
slug: "type-of-databases"
created: 2024-04-27T13:58:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "database"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754936672007974'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modni7ogpx2l'
---
# OLTP
- Transactional processing
- Need to update what is happening
- High volume of small transactions
- Fast access
- Normalised DB 
	- De-duplication
	- Other things, basically things need to fit in a table
- [ACID](/til/acid)

# OLAP
- Analytical Processing
- Large data volume
- Historical data
- Mainly read only
- [Azure Data Warehouse and Analytics](/til/azure-data-warehouse-and-analytics)

---
# references: