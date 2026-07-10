---
tags:
  - terraform
  - azure
aliases:
---

# Details

DB Name - sbwehcmsqldb_poc
Server Name - sbwehcmsqldbserver_poc
Region - West Europe
Compute - Basic, 2 GB storage

## Terraform VM

## Azure
1. SP login

```az cli

az login --service-principal -u 562ee4ba-6359-4e5d-a4d6-83de64a445f2 -p \_hvmAThuf7R\_41J2hF05HLr.34v-CpFFOg --tenant 0fadfa8b-6e6e-44b1-a381-6203bfe1a199

```

  

2. List all az groups

```az cli

 az group list --subscription "bf1dbcea-044c-4e6d-ad6c-d54cecf69616"

```

  

3. Get resource group: Sandbox RG: [WE-HCM-RG-POC](https://portal.azure.com/#@tryg.onmicrosoft.com/resource/subscriptions/bf1dbcea-044c-4e6d-ad6c-d54cecf69616/resourceGroups/WE-HCM-RG-POC "https://portal.azure.com/#@tryg.onmicrosoft.com/resource/subscriptions/bf1dbcea-044c-4e6d-ad6c-d54cecf69616/resourcegroups/we-hcm-rg-poc")

``` bash

$ az group show --name WE-HCM-RG-POC --subscription "bf1dbcea-044c-4e6d-ad6c-d54cecf69616"                                         {

  "id": "/subscriptions/bf1dbcea-044c-4e6d-ad6c-d54cecf69616/resourceGroups/WE-HCM-RG-POC",

  "location": "westeurope",

  "managedBy": null,

  "name": "WE-HCM-RG-POC",

  "properties": {

    "provisioningState": "Succeeded"

  },

  "tags": {

    "ApplicationName": "HCM PoC",

    "BusinessUnit_CostCenter": "74170",

    "Environment": "Development",

    "HPNumber": "HPNumber",

    "TCSCloudOps_Scope": "YES"

  },

  "type": "Microsoft.Resources/resourceGroups"

}

```

  

export ARM_CLIENT_ID="562ee4ba-6359-4e5d-a4d6-83de64a445f2"

export ARM_CLIENT_SECRET="_hvmAThuf7R_41J2hF05HLr.34v-CpFFOg"

export ARM_SUBSCRIPTION_ID="bf1dbcea-044c-4e6d-ad6c-d54cecf69616"

export ARM_TENANT_ID="0fadfa8b-6e6e-44b1-a381-6203bfe1a199"

export TF_LOG="DEBUG"

  

subscription_id = "0fadfa8b-6e6e-44b1-a381-6203bfe1a199"

client_id       = "562ee4ba-6359-4e5d-a4d6-83de64a445f2"

client_secret   = "_hvmAThuf7R_41J2hF05HLr.34v-CpFFOg\"

tenant_id       = "0fadfa8b-6e6e-44b1-a381-6203bfe1a199"

  

terraform import azurerm_resource_group.WE-HCM-RG-POC /subscriptions/bf1dbcea-044c-4e6d-ad6c-d54cecf69616/resourceGroups/WE-HCM-RG-POC

  

DB Name - sbwehcmsqldb_poc

Server Name - sbwehcmsqldbserver_poc

Region - West Europe

Compute - Basic, 2 GB storage

Please update the Firewall of SQL Database with below IP address (TCS ECP Datacenter IP)

91.232.248.247

  
  

^Dq&eyECA#hnXZT

terraform destroy -target=azurerm_sql_database.sbwehcmsqldbpoc

terraform destroy -target=azurerm_sql_server.sbwehcmsqldbserverpoc

terraform destroy -target=azurerm_sql_firewall_rule.sbwehcmsqldbfw


---
references: