---
title: Different Types of Admission Controllers
slug: different-types-of-admission-controllers
created: 2026-10-26T13:48:00.000Z
updated: 2026-10-26T13:50:17.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117512035494335580'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mytuivekdw24'
  - 'https://www.threads.com/@sajal24x7/post/De_emYtEXBK'
---
There are two types of [admission controllers](/til/admission-controllers-in-kubernetes):
1. Validating - can validate the request and allow or deny it 
2. Mutating - can change the request 

There are also those who can do both.

Mutating happens first, then validating.

