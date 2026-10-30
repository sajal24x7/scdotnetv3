---
title: "Vertical Pod Autoscaler"
slug: "vertical-pod-autoscaler"
created: 2026-10-29T16:04:00+02:00
updated: 2026-10-29T16:11:08+02:00
category: til
tags: ["k8s"]
---
Similar to [HPA](/til/horizontal-pod-autoscaling), it monitors resources, and increases resources on the pod if required. It is not inbuilt, it needs to be downloaded and applied.

It has three components -
1. Admission controller - applies the changes recommender suggests
2. Updater - evicts the pods if needed based on recommender 
3. Recommender - does not modify anything, just provides recommendations.

`updateMode` controls how this happens. 
1. Off - only recommendations, no changes
2. Initial - only changes pods on creation
3. Recreate - Evicts pods if usage goes beyond range. 
4. InPlaceOrRecreate - Tries to update without restarting a pod - future feature.