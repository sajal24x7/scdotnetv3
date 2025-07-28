---
title: Azure RBAC custom roles
slug: azure-rbac-custom-roles
pubDate: '2024-01-07T20:38:00+03:00'
updatedDate: '2024-01-07T20:38:00+03:00'
category: til
tags:
- azure
- rbac
- entra
---

- created using role definition

# Consists of
## Metadata
- name, description
##  Permissions
-  for management/data operations
- Actions
	- allowed control plane actions
	- no deny needed as only allowed permissions are given, nothing else
- NotActions
	- Deny specific things under something allowed above (example: give permission to everything under virtual machines under actions, then deny delete vms actions here)
- DataActions
	- allowed data plane actions
- NotDataActions
	- not allowed data plane actions
## Scopes
- Defines where roles can be used
- AssignableScopes
- Examples:
	- Root - /*
	- Management Groups
	- Subscriptions
	- Resource Groups


To create a custom role, following things are required:
```json
{
  "Name": "",
  "Description": "",
  "Actions": [],
  "NotActions": [],
  "DataActions": [],
  "NotDataActions": [],
  "AssignableScopes": []
}
```

Sample:
```json
{
  "Name": "Reader",
  "Id": "acdd72a7-3385-48ef-bd42-f606fba81ae7",
  "IsCustom": false,
  "Description": "Lets you view everything, but not make any changes.",
  "Actions": [
    "*/read"
  ],
  "NotActions": [],
  "DataActions": [],
  "NotDataActions": [],
  "AssignableScopes": [
    "/"
  ]
}
```

---
# references
https://learn.microsoft.com/en-us/azure/role-based-access-control/custom-roles