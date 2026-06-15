---
title: Bicep Parameters
slug: bicep-parameters
created: '2024-07-19T18:59:00+03:00'
updated: '2024-07-19T18:59:00+03:00'
category: til
tags:
  - azure
  - bicep
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754961495633304'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modntjaudn2o'
---

- auto-complete for resources in vs code
- Parameters can be added with param block
	- Decorators can be added with @ (Things like min/max length)
		- @allowed
		- description can also be added
		- @secure - for passwords/secure strings, etc
			- Don't use [[202407191915 Bicep parameter files|Parameter files]] for secrets
			- use [[202407191923 Azure Key Vault|Azure key vault]]
- Implicit dependency between resources by using the id of a resource created earlier, example id of [[202404201400 Azure App service#App service plan]] when defining [[202404201400 Azure App service|app service]] 
- output keyword to send output
- param types : string, int, bool, object and array
- 3 ways to define parameters (in order of priority least->most)
	- default
	- [[202407191915 Bicep parameter files|parameter file]]
	- command-line

```bicep
param Identifier Type = DefaultValue

# Examples
param appServiceAppName string
param appServiceAppName string = 'toy-product-launch-1'
```

```bicep
@allowed([
  'nonprod'
  'prod'
])
param environmentType string

## Based on the above, create a var which will set sku based on environment
# ? is if else , true then first things, false then after : thing
var storageAccountSkuName = (environmentType == 'prod') ? 'Standard_GRS' : 'Standard_LRS'
var appServicePlanSkuName = (environmentType == 'prod') ? 'P2V3' : 'F1'
```
# Expressions
When writing templates we don't want to hard-code anything. So use expressions.

```bicep
# Example
param location string = resourceGroup().location

# Another Example
param storageAccountName string = uniqueString(resourceGroup().id)
```

Unique string will give unique string but it will not be so readable. So string extrapolation. 

```bicep

param storageAccountName string = 'toylaunch${uniqueString(resourceGroup().id)}'
```

# Objects
- create an object type `param` to specify structured data together

```bicep
param appServicePlanSku object = {
  name: 'F1'
  tier: 'Free'
  capacity: 1
}
```
- can be used in dot notations
```bicep
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: appServicePlanSku.name
    tier: appServicePlanSku.tier
    capacity: appServicePlanSku.capacity
  }
}
```
- Useful for specifying tags

# Array
list of things. strings, or objects

```bicep
# List of objects
param cosmosDBAccountLocations array = [
  {
    locationName: 'australiaeast'
  }
  {
    locationName: 'southcentralus'
  }
  {
    locationName: 'westeurope'
  }
]
```



---
# references:
