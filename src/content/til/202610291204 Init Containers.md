---
title: Init Containers
slug: init-containers
created: 2026-10-29T10:04:00.000Z
updated: 2026-10-29T10:11:20.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117529266832877017'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mz3jesdg2x2y'
  - 'https://www.threads.com/@sajal24x7/post/DfHUGHeIKnI'
---
Init containers are a type of [multi-container pod](/til/multi-container-pods).

To create this type of pod, use the `initContainer` spec. They support most of the other fields of app containers. They do not support `lifecycle`, `livenessProbe`, `readinessProbe` or `startupProbe` fields.
