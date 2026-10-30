---
title: "Init Containers"
slug: "init-containers"
created: 2026-10-29T12:04:00+02:00
updated: 2026-10-29T12:11:20+02:00
category: til
tags: ["k8s"]
---
Init containers are a type of [multi-container pod](/til/multi-container-pods).

To create this type of pod, use the `initContainer` spec. They support most of the other fields of app containers. They do not support `lifecycle`, `livenessProbe`, `readinessProbe` or `startupProbe` fields.