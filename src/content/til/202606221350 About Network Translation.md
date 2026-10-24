---
title: "About Network Translation"
slug: "about-network-translation"
created: 2026-06-22T13:50:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["network", "nat"]
---
There are not enough public v4 IPs available for all the devices we have. What we do usually is use private IPs from one of the three options :
- 10.0.0.0/8
- 172.16.0.0/12
- 192.168.0.0/16

But then, when we need to talk to the internet, the gateway device (which has a public IP) manages a route table to map traffic coming from devices in our subnet to a different port on the public IP. The destination then sends traffic back to this translated IP. The gateway device then forwards it to the device in our private IP space.

This is SNAT --> Source Network Address Translation.