---
title: "How to handle dependencies in Bicep"
slug: "how-to-handle-dependencies-in-bicep"
pubDate: 2024-07-23T05:34:23
updatedDate: 2024-07-23T08:23:36
category: blog
tags: ["Azure", "Tech Notes"]
image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTc3M3wwfDF8c2VhcmNofDV8fHNlcnZlciUyMGNvZGV8ZW58MHx8fHwxNzIxNzEyODUwfDA&ixlib=rb-4.0.3&q=80&w=2000"
---
Bicep deploys resources in parallel. Which is what you might want as that is faster. However, there might be dependencies. I came across this while creating the environment needed for [this exercise](https://learn.microsoft.com/en-in/training/modules/configure-vnet-peering/6-simulation-peering). It was basically a lab on vnet-peering.  
What I needed to create was this:

In 2 regions,

     1. 3 VNets
     2. 3 VMs in these 3 VNets

In this scenario, there are dependencies. To create the VM you need the VNet, and the VNIC which would be attached to the VM, among other things.  
When I started deploying it initially without defining dependencies, it failed to create the VNIC as the VNET was not deployed yet.

There are two ways to handle dependencies in bicep:

  1. Implicit
  2. Explicit

An implicit dependency is created when a resource declaration references another resource in its definition.  
To specify an explicit dependency you use the `dependsOn` keyword.  
PowerShell is a faster and simpler \(at least to me\) way to create these resources. But it is a better way in case of one-off things. If you want to deploy resources again and again IaC tools \(bicep\) are a better option. Using bicep would ensure that I could deploy the same resources with certainty. There would be no drift. Plus, I would get to learn Bicep.

So, I built the template from scratch. The code is kept [here](https://github.com/sajal24x7/azure/tree/main/network-peering).