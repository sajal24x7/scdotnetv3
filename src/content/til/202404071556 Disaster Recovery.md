---
title: Disaster Recovery
slug: disaster-recovery
created: '2024-04-07T15:56:00+03:00'
updated: '2024-04-07T15:56:00+03:00'
category: til
tags:
  - resiliency
  - azure
  - disasterrecovery
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754910305770124'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modn4a2u6a2v'
---

1. Disaster Recovery is moving things from one location to another when the active one is not available for any reason. 
2. DR should be part of change activity. That is if we are making any change how does that work with our DR plan.

# Options for protection
1. [[202404081937 Recreate Resources|recreate]]
2. Backup Restore
3. [[202404071441 Replication|replication]]
# Metrics
1. [[202404081931 Recovery Point Objective|Recovery Point Objective]]
2. [[202404081933 Recovery Time Objective|Recovery Time Objective]]
# Replication Options
[[202404071545 Preference for replications]]
# Types
1. Planned
	1. should be no data loss
2. Unplanned
	1. no clean failover - bigger outage
	2. data loss will be there
3. Testing

---
# references:
