---
tags:
  - azure
  - azcli
  - ssh
aliases:
  - How to create ssh key with azcli
category: til
---
Reference to [az sshkey](https://learn.microsoft.com/en-us/cli/azure/sshkey?view=azure-cli-latest).

```bash

# To create
az sshkey create --name "mySSHKey" --resource-group "myResourceGroup"

# To create with encryption type
az sshkey create --name "mySSHKey" --resource-group "myResourceGroup" --encryption-type "RSA"

# To list keys
az sshkey list
```