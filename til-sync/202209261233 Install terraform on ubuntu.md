---
aliases:
  - Install terraform on ubuntu
tags:
  - "#terraform"
category: til
updated: 2026-08-25T14:30:56
---
## Install terraform on Ubuntu server

1. Add the HashiCorp [GPG key](https://apt.releases.hashicorp.com/gpg "HashiCorp GPG key").

```bash

curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -

```

2. Add the official HashiCorp Linux repository.

```bash

sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"

```

3. Add the official HashiCorp Linux repository.

```bash

sudo apt-get update && sudo apt-get install terraform

```

  

export HTTP\_PROXY=http://172.21.21.5:3128

export HTTPS\_PROXY=https://172.21.21.5:3128

  
  

[Terraform Azure Examples](https://github.com/terraform-providers/terraform-provider-azurerm/tree/master/examples)

  

## VM Config

### Extend LVs

1. Check physical volumes.

```bash

pvs

```

2. Extend partition to fill available space. Use [growpart]([https://www.systutorials.com/docs/linux/man/1-growpart/](https://www.systutorials.com/docs/linux/man/1-growpart/)).

```bash

growpart /dev/sda 3

```

3. Resize physical volume. Use [pvresize]([https://www.systutorials.com/docs/linux/man/8-pvresize/](https://www.systutorials.com/docs/linux/man/8-pvresize/))

```bash

pvresize /dev/sda3

```

4. List logical volumes.

```bash

lvs

```

5. Extend logical volumes.

```bash

lvextend ubuntu-vg/homelv -L 3GB -r

  

```
---
references: