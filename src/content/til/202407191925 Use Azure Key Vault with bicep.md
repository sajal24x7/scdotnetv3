---
title: Use Azure Key Vault With Bicep
slug: use-azure-key-vault-with-bicep
pubDate: '2024-07-19T19:25:00+03:00'
updatedDate: '2024-07-19T19:25:00+03:00'
category: til
tags:
- azure
- bicep
---

# In [[202407191915 Bicep parameter files|parameter file]]
```bicep
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "sqlServerAdministratorLogin": {
      "reference": {
        "keyVault": {
          "id": "/subscriptions/f0750bbe-ea75-4ae5-b24d-a92ca601da2c/resourceGroups/PlatformResources/providers/Microsoft.KeyVault/vaults/toysecrets"
        },
        "secretName": "sqlAdminLogin"
      }
    },
    "sqlServerAdministratorPassword": {
      "reference": {
        "keyVault": {
          "id": "/subscriptions/f0750bbe-ea75-4ae5-b24d-a92ca601da2c/resourceGroups/PlatformResources/providers/Microsoft.KeyVault/vaults/toysecrets"
        },
        "secretName": "sqlAdminLoginPassword"
      }
    }
  }
}
```

# For module
```bicep
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' existing = {
  name: keyVaultName
}

module applicationModule 'application.bicep' = {
  name: 'application-module'
  params: {
    apiKey: keyVault.getSecret('ApiKey')
  }
}
# existing keyword tells it not to deploy as it exists already

```

---
# references:
[MS LEarn](https://learn.microsoft.com/en-in/training/modules/build-reusable-bicep-templates-parameters/5-how-secure-parameter)