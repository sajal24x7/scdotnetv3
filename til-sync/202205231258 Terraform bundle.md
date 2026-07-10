---
tags:
  - terraform
aliases:
---

# Terraform bundle tool install

## Pre-requisites
1. git
2. go / [[202205251306 Install go]]

## Install

```bash
# Clone v0.15 branch
$ git clone --single-branch --branch=v0.15 --depth=1 https://github.com/hashicorp/terraform.git

$ cd terraform

$ go build -o ../terraform-bundle ./tools/terraform-bundle

```

# Terrform bundle creation



---
references:
1. [terraform/README.md at v0.15 · hashicorp/terraform · GitHub](https://github.com/hashicorp/terraform/blob/v0.15/tools/terraform-bundle/README.md)
2. [Download and install - The Go Programming Language](https://go.dev/doc/install)