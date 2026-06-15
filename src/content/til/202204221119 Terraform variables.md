---
title: Terraform Variables
slug: terraform-variables
created: '2022-04-22T11:19:00+03:00'
updated: '2022-04-22T11:19:00+03:00'
category: til
tags:
  - terraform
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhnbcedp2v'
---


# Precedence
Terraform loads variables in the following order, with later sources taking precedence over earlier ones:
-   Environment variables
-   The `terraform.tfvars` file, if present.
-   The `terraform.tfvars.json` file, if present.
-   Any `*.auto.tfvars` or `*.auto.tfvars.json` files, processed in lexical order of their filenames.
-   Any `-var` and `-var-file` options on the command line, in the order they are provided. (This includes variables set by a Terraform Cloud workspace.)

---
references:
1. [Input Variables - Configuration Language | Terraform by HashiCorp](https://www.terraform.io/language/values/variables)
