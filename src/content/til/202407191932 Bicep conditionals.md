---
title: Bicep conditionals
slug: bicep-conditionals
pubDate: '2024-07-19T19:32:00+03:00'
updatedDate: '2024-07-19T19:32:00+03:00'
category: til
tags:
- azure
- bicep
---

- `if` keyword
	- define a `bool` param and if needed, then only deploy the resource
- check using operators
	- `==`
	- better to create a [[202407191900 Bicep variables|Bicep variables]] for the evaluation

# Example
[[202404061212 Azure Resources|ARM]] evaluates the property expressions before the conditionals on the resources.

```bicep
resource auditingSettings 'Microsoft.Sql/servers/auditingSettings@2021-11-01-preview' = if (auditingEnabled) {
  parent: server
  name: 'default'
  properties: {
    state: 'Enabled'
    storageEndpoint: environmentName == 'Production' ? auditStorageAccount.properties.primaryEndpoints.blob : ''
    storageAccountAccessKey: environmentName == 'Production' ? listKeys(auditStorageAccount.id, auditStorageAccount.apiVersion).keys[0].value : ''
  }
}

```

---
# references:
[MS Learn](https://learn.microsoft.com/en-in/training/modules/build-flexible-bicep-templates-conditions-loops/2-use-conditions-deploy-resources)