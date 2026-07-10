---
tags:
  - "#windows"
  - "#failover"
aliases:
  - Windows cluster on vmware
---


The WSFC cluster heartbeat time-out must be modified at least to the values listed below: 
(get-cluster -name ).SameSubnetThreshold = 10
(get-cluster -name ).CrossSubnetThreshold = 20
(get-cluster -name ).RouteHistoryLength = 40
The virtual hardware version for the WSFC virtual machine must be version 11 and later

You can also adjust other properties to control the workload tolerance for failover. Adjusting delay controls how often heartbeats are sent between the clustered node. The default setting is 1 second and the maximum setting is 2 seconds. Set the SameSubnetDelay value to 1. Threshold controls how many consecutive heartbeats can be missed before the node considers its partner to be unavailable and triggers the failover process. The default threshold is 5 heartbeats and the maximum is 120 heartbeats. It is the combination of delay and threshold that determines the total elapsed time during which clustered Windows nodes can lose communication before triggering a failover. When the clustered nodes are in different subnets, they are called CrossSubnetDelay and CrossSubnetThreshold. Set the CrossSubnetDelay value to 2 and the CrossSubnetThreshold value to 20.



---
# references: