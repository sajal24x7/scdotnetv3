---
title: Azure App Service
slug: azure-app-service
created: '2024-04-20T14:00:00+03:00'
updated: '2024-04-20T14:00:00+03:00'
category: til
tags:
- azure
- appservices
---

- original paas
- hosts web applications (http/gRPC)
- can scale up or out
- provides different [[202404121703 Azure VNet|VNet]] integration options
	- private endpoint for inbound requests
	- delegated subnet in our [[202404121703 Azure VNet|VNet]] for outbound requests to other Azure resources
	- compared to [[202404201400 Azure App service#App service environments]] which are integrated to [[202404121703 Azure VNet|VNet]] and don't require these things
- Can use App service for authentication and authorization
- Can backup
	- requires a [[202404091847 Azure Storage Overview|Azure storage]] container in the same sub
	- requires premium/standard
- Can monitor using Azure insights
## Which OS supports what
```bash
az webapp list-runtimes --os linux
dotnetcore
node
python
php
java
jbosseap
tomcat

az webapp list-runtimes --os windows
dotnet
aspnet
node
java
tomcat
```

# App service plan
- You pick an App service plan. Based on the plan you get access to certain resources (certain number of nodes).
- On app service plan your apps run. So 2 apps in same service plan for example.
- You can move apps from one app service plan to other, but it has to be in same webspace (region+os+RG)
# Deployment slots
- For new deployment, it can be put in staging
- When ready, with a VIP swap, staging can be made production
- If any issues, with VIP swap we can put it back.
- Avoid cold start during deployment slots
- You can clone settings to new slot but not content
- Swap with preview breaks the process in two halves:
	- slot specific settings are copied in phase 1
		- we can check if for example db connection string breaks
	- in phase 2, it would remove temporary changes and proceed with swap
# App service environments
- v3 used with v2 Isolated plans
- provides isolation 
	- this is deployed in your [[202404121703 Azure VNet|VNet]] when compared to App service which is shared
	- control plane is separate Azure subnet
	- Data plane is in our vnet
- apps are deployed in app service plans

# Scaling
Scale out has two options
	- Azure app service autoscaling (based on rules we define)
		- Metric (on all the nodes a certain threshold should be reached)
		- Scheduled
	- Azure App Service automatic scaling 
		- avoid cold start issues
## Best practices
- Enough margin between scale out and scale in values
- Use proper metric
- Different thresholds for scale out and in

## How does it work
Suppose:
1. scale up when cpu >=80
2. scale down by 1 when cpu <=60

you have 2 nodes. utilization in both goes above 80. so it scales up to 3 nodes.
now assume utilization comes down to 60. it calculates after scale what will happen. 
current 60x3 = 180.  
after scale : 180/2 = 90. so it will not scale as 90 > 80
later, utilization comes down to 50. 
current 50x3=150.
after scale: 150/2 = 75. which is less than 80. 
so now it will scale down.

---
# references:
[App service overview](https://learn.microsoft.com/en-us/azure/app-service/overview)
[Settings which get copied during app clone](https://learn.microsoft.com/en-in/training/modules/configure-azure-app-services/6-add-deployment-slots)

| Swapped settings                                                                                                                                                                                                                                                                                                            | Slot-specific settings                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| General settings, such as framework version, 32/64-bit, web sockets   <br>App settings *****  <br>Connection strings *****  <br>Handler mappings   <br>Public certificates   <br>WebJobs content   <br>Hybrid connections ******  <br>Service endpoints ******  <br>Azure Content Delivery Network ******  <br>Path mapping | Custom domain names   <br>Nonpublic certificates and TLS/SSL settings   <br>Scale settings   <br>Always On   <br>IP restrictions   <br>WebJobs schedulers   <br>Diagnostic settings   <br>Cross-origin resource sharing (CORS)   <br>Virtual network integration   <br>Managed identities   <br>Settings that end with the suffix _EXTENSION_VERSION |
[App service plans](https://learn.microsoft.com/en-in/training/modules/configure-app-service-plans/3-determine-plan-pricing)
[App service pricing](https://azure.microsoft.com/en-in/pricing/details/app-service/linux/)

| Feature                          | Free                 | Shared               | Basic                          | Standard             | Premium                     | Isolated                              |
| -------------------------------- | -------------------- | -------------------- | ------------------------------ | -------------------- | --------------------------- | ------------------------------------- |
| Usage                            | Development, Testing | Development, Testing | Dedicated development, Testing | Production workloads | Enhanced scale, performance | High performance, security, isolation |
| Web, mobile, or API applications | 10                   | 100                  | Unlimited                      | Unlimited            | Unlimited                   | Unlimited                             |
| Disk space                       | 1 GB                 | 1 GB                 | 10 GB                          | 50 GB                | 250 GB                      | 1 TB                                  |
| Auto scale                       | n/a                  | n/a                  | n/a                            | Supported            | Supported                   | Supported                             |
| Deployment slots                 | n/a                  | n/a                  | n/a                            | 5                    | 20                          | 20                                    |
| Max instances                    | n/a                  | n/a                  | Up to 3                        | Up to 10             | Up to 30                    | Up to 100                             |
[Azure app scaling](https://learn.microsoft.com/en-in/training/modules/scale-apps-app-service/3-app-service-autoscale-conditions-rules)
