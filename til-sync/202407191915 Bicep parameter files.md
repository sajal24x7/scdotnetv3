---
aliases:
  - Parameter files
  - parameter file
tags:
  - "#azure"
  - "#bicep"
category: til
updated: 2026-08-25T14:30:56
---
- created in json
- specify all [[202407191859 Bicep parameters|Bicep parameters]] values in one go
- good idea to include the name of the environment in the name of the [[202407191915 Bicep parameter files|parameter file]]
# How to use
```powershell
New-AzResourceGroupDeployment -TemplateFile main.bicep -TemplateParameterFile main.parameters.json
```

# Example
```bicep
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "appServicePlanInstanceCount": {
      "value": 3
    },
    "appServicePlanSku": {
      "value": {
        "name": "P1v3",
        "tier": "PremiumV3"
      }
    },
    "cosmosDBAccountLocations": {
      "value": [
        {
          "locationName": "australiaeast"
        },
        {
          "locationName": "southcentralus"
        },
        {
          "locationName": "westeurope"
        }
      ]
    }
  }
}
```

---
# references:
[MS Learn](https://learn.microsoft.com/en-in/training/modules/build-reusable-bicep-templates-parameters/4-how-use-parameter-file-with-bicep?pivots=powershell)