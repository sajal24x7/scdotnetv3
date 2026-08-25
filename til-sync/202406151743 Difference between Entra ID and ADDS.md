---
aliases:
  - Difference between Entra ID and ADDS
tags:
  - "#azure"
  - "#entra"
category: til
updated: 2026-08-25T14:30:56
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