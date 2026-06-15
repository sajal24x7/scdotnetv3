---
title: Difference Between Lists Tuples and Sets
slug: difference-between-lists-tuples-and-sets
created: 2026-03-25T10:15:05.000Z
updated: 2026-03-25T10:15:05.000Z
category: til
tags:
  - python
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116289289934999203'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mhuuam2q2s2y'
  - 'https://www.threads.com/@sajal24x7/post/DWTcBQbEeBS'
---

Lists are ordered, mutable and allow duplicates.
Tuples are ordered, immutable and allow duplicates.
Sets are unordered, mutable and do not allow duplicates.

Sets can be used to deduplicate data or performing membership checks.

```python
## Lists
list_name = [“web1”, “web2”]

# Tuples
tuple_name = (“web1”, “web2”)

# Set
set_name = {“web1”, “web2”}
``` 