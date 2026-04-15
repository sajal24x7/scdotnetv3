---
title: Azure Monitoring
slug: azure-monitoring
pubDate: '2024-08-04T12:24:00+03:00'
updatedDate: '2024-08-04T12:24:00+03:00'
category: til
tags:
- azure
- monitoring
---

- Monitoring is available for all [[202404061212 Azure Resources|azure resources]]
	- usually a tab
- Monitoring starts whenever a resource is created in a subscription
 
# Components
```mermaid
flowchart LR
	Source --> DataStores --> AzureMonitorInsights
```

## Source
Collection of data across the following tiers:
1. Application
2. Guest OS
3. [[202404061212 Azure Resources|Azure resource]]
4. [[202401101441 Azure subscriptions|Azure subscription]] (Activity log - stored for 90 days)
5. Tenant (Services like [[202312231420 Microsoft Entra|Entra]])

## Data Stores
Azure Monitor Metrics
Azure Monitor Logs

# Azure Monitor Insights
Insights performs different functions with the collected data:
1. Insights
2. Visualize
3. Analyze
4. Respond
5. Integrate


---
# references:
[MS Learn](https://learn.microsoft.com/en-us/training/modules/configure-azure-monitor/3-describe-components)
>- **Get insights**: Access the Azure Application Insights extension to Azure Monitor to use the Application Performance Monitoring (APM) features. You can use APM tools to monitor your application performance and gather trace logging data. Application Insights are available for many Azure services, such as Azure Virtual Machines and Azure Virtual Machine Scale Sets, Azure Container Instances, Azure Cosmos DB, and Azure IoT Edge.
>- **Visualize**: Utilize the many options in Azure Monitor for viewing and interpreting your gathered metrics and logs. You can use Power BI with the Azure Workbooks feature of Azure Monitor and access configurable dashboards and views.
>- **Analyze**: Work with Azure Monitor Logs (Log Analytics) in the Azure portal to write log queries for your data. You can interactively analyze your log data by using Azure Monitor Metrics and the powerful analysis engine.
>- **Respond**: Set up log alert rules in Azure Monitor to receive notifications about your application performance. You can configure the service to take automated action when the results of your queries and alerts match certain conditions or results.  
>- **Integrate**: Ingest and export log query results from the Azure CLI, Azure PowerShell cmdlets, and various APIs. Set up automated export of your log data to your Azure Storage account or Azure Event Hubs. Build workflows to retrieve your log data and copy to external locations with Azure Logic Apps.