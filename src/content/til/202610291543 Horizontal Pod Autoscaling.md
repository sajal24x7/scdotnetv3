---
title: Horizontal Pod Autoscaling
slug: horizontal-pod-autoscaling
created: 2026-10-29T13:43:00.000Z
updated: 2026-10-29T13:52:36.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117529268949290201'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mz3jfr2mgp2h'
  - 'https://www.threads.com/@sajal24x7/post/DfHUKDKoMp6'
---
It is implemented as a API resource and controller. It is a control loop that runs intermittently (default 15sec). Once during each run, the controller checks resource utilisation against the metrics specified in definition, then calculates utilisation after target state is reached, then scales it as needed.


## Sample definition file

```yaml
apiVersion: autoscaling/v2 
kind: HorizontalPodAutoscaler 
metadata: 
  name: php-apache-hpa
  namespace: default 
spec: 
  scaleTargetRef: 
    apiVersion: apps/v1 
    kind: Deployment 
    name: php-apache 
    minReplicas: 1 
    maxReplicas: 10 
    metrics: 
      - type: Resource 
      resource: 
        name: cpu 
        target:
          type: Utilization
          averageUtilization: 50
```

