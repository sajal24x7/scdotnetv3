---
title: "Horizontal Pod Autoscaling"
slug: "horizontal-pod-autoscaling"
created: 2026-10-29T15:43:00+02:00
updated: 2026-10-29T15:52:36+02:00
category: til
tags: ["k8s"]
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

