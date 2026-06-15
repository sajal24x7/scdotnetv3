---
title: Type of Databases
slug: type-of-databases
created: '2024-04-27T13:58:00+03:00'
updated: '2024-04-27T13:58:00+03:00'
category: til
tags:
  - azure
  - database
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
- [[202404271400 ACID|ACID]]

# OLAP
- Analytical Processing
- Large data volume
- Historical data
- Mainly read only
- [[202404261931 Azure Data warehouse and analytics]]

---
# references:
