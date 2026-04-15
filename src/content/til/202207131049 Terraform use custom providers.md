---
title: Terraform use custom providers
slug: terraform-use-custom-providers
pubDate: '2022-07-13T10:49:00+03:00'
updatedDate: '2022-07-13T10:49:00+03:00'
category: til
tags:
- terraform
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