---
title: "How to Create Ssh Key With Azcli"
slug: "how-to-create-ssh-key-with-azcli"
created: 2026-05-06T10:21:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "azcli", "ssh"]
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