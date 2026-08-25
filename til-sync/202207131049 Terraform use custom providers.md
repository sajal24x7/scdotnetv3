---
aliases:
  - Terraform use custom providers
tags:
  - "#terraform"
category: til
updated: 2026-08-25T14:30:56
---
In .terraformrc file provide the location of the local mirror from where provider should be installed

```terraform
provider_installation {
  filesystem_mirror {
    path    = "/home/c3admin/ipamTest/.terraform.d/plugins/"
    include = ["hashicorp.com/*/*"]
  }
}
```

---
references:
https://www.terraform.io/cli/config/config-file#provider-installation