---
title: "Multi-container Pods"
slug: "multi-container-pods"
created: 2026-10-29T11:49:00+02:00
updated: 2026-10-29T12:05:32+02:00
category: til
tags: ["k8s"]
---
A [pod](/til/pods) can have one or more containers running in it. If it runs multiple containers, there are primarily three different patterns:

1. Co-located 
2. Init 
3. Sidecar

## Co-located
When both containers are dependent on each other and both continue running for the duration of the pod’s lifecycle.

## Init
Init containers are run before the app container is started. They run, do their thing and then the main container is started.

## Sidecar
This starts before the main app container and continues to run. This is how they are different from init containers. Sidecar containers may be used for monitoring, for example.