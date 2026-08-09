---
title: On Building Scalable Control Planes
slug: on-building-scalable-control-planes
created: 2026-08-09T09:45:00.000Z
updated: 2026-08-09T10:48:14.000Z
category: micro
tags:
  - distributed-systems
  - aws
  - ec2
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117065729075712925'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3msno4agxl52k'
  - 'https://www.threads.com/@sajal24x7/post/Db0hX2uoA6H'
---
[On building scalable control planes by Dr Werner Vogels](https://www.allthingsdistributed.com/2026/08/on-building-scalable-control-planes.html)

> One thing the team talked about constantly, almost to the point where it became a mantra, was that no matter what happens to the control plane, VMs that are already running need to keep working. We call this static stability, and it sounds obvious because of course running VMs should keep running. But at scale, obvious things are the hardest to protect, because every new feature, every change, every dependency is a chance to accidentally violate that guarantee. Maintaining it is the difference between an outage where customers can’t launch new resources and an outage where everything stops. Both are bad, but the second is catastrophically worse. The fact that EC2 was statically stable gave me some comfort in my early days.

Such an insightful post. I come from the context of servers having memorable names, sure a large infrastructure (4000+ servers) but still a context where you ssh to servers and fix them if they go down.
