---
title: Replace CNO for Cluster
slug: replace-cno-for-cluster
created: '2024-07-03T16:20:00+03:00'
updated: '2024-07-03T16:20:00+03:00'
category: til
tags:
  - windows
  - cluster
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754948562429569'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnnmio7e2o'
---

# Issue
CNO which was created was deleted on AD side, and new computer object was created. 
Cluster validation fails with "Unable to find computer object"

# Fix
1. Create a new computer node. Ignore if CNO already exists.
2. Get objectGUID attribute in hexadecimal. Remove spaces and convert in lower case.
3. On the cluster nodes,  use Regedit and view **HKLM\Cluster** and identify the value of **ClusterNameResource**. It will be a long ugly number and is the Cluster Name Resource GUID.
4. Go to **HKLM\Cluster\Resources\ClusterNameResourceGUID\Parameters**
5. Edit the **ObjectGUID** key and replace the value with the value you copied in step 3. This tells the cluster to use the new CNO.
6. Edit on all nodes. 
7. Try cluster repair.

---
# references:
[Field Notes of a Computer Geek: Replace Missing Cluster Name Object for DAG (byronwright.blogspot.com)](https://byronwright.blogspot.com/2014/06/replace-missing-cluster-name-object-for.html)
