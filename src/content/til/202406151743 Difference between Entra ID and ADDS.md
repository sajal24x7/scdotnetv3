---
title: Difference Between Entra ID and ADDS
slug: difference-between-entra-id-and-adds
pubDate: '2024-06-15T17:43:00+03:00'
updatedDate: '2024-06-15T17:43:00+03:00'
category: til
tags:
- azure
- entra
---


| Property         | ADDS                     | Entra                                                                                                                         |
| ---------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Structure        | hierarchical: OUs, GPOs. | flat                                                                                                                          |
| Computer objects | Has                      | Does not have                                                                                                                 |
| Query/Manage     | LDAP                     | REST over HTTP/HTTPS                                                                                                          |
| Protocol         | Kerberos                 | HTTP and HTTPS protocols such as SAML, WS-Federation, and OpenID Connect for authentication, and uses OAuth for authorization |
| Federation       | Trusts for delegation    | Can be Federated with 3rd parties                                                                                             |


---
# references:
[MS Learn](https://learn.microsoft.com/en-us/training/modules/understand-azure-active-directory/3-compare-azure-active-directory-domain-services)