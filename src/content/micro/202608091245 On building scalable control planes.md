---
title: "On Building Scalable Control Planes"
slug: "on-building-scalable-control-planes"
created: 2026-08-09T12:45:00+03:00
updated: 2026-08-09T12:48:14+02:00
category: micro
tags: ["distributed-systems", "aws", "ec2"]
---
[On building scalable control planes by Dr Werner Vogels](https://www.allthingsdistributed.com/2026/08/on-building-scalable-control-planes.html)

> One thing the team talked about constantly, almost to the point where it became a mantra, was that no matter what happens to the control plane, VMs that are already running need to keep working. We call this static stability, and it sounds obvious because of course running VMs should keep running. But at scale, obvious things are the hardest to protect, because every new feature, every change, every dependency is a chance to accidentally violate that guarantee. Maintaining it is the difference between an outage where customers can’t launch new resources and an outage where everything stops. Both are bad, but the second is catastrophically worse. The fact that EC2 was statically stable gave me some comfort in my early days.

Such an insightful post. I come from the context of servers having memorable names, sure a large infrastructure (4000+ servers) but still a context where you ssh to servers and fix them if they go down.