---
title: Setup Password Less Ssh
slug: setup-password-less-ssh
created: '2022-04-25T15:55:00+03:00'
updated: '2022-04-25T15:55:00+03:00'
category: til
tags:
  - linux
  - ssh
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhnglt772m'
---


Create SSH pair
``` bash
ssh-keygen -f /home/thor/.ssh/maria
```

Copy public key to remote server
``` bash
ssh-copy-id -i ~/.ssh/tatu-key-ecdsa user@host
```

---
references:
1. [How to Setup Passwordless SSH Login | Linuxize](https://linuxize.com/post/how-to-setup-passwordless-ssh-login/#:~:text=In%20this%20tutorial%2C%20we%20will%20show%20you%20how,append%20it%20to%20the%20remote%20hosts%20~%2F.ssh%2Fauthorized_keys%20file.?msclkid=ce1c0729c49611ecb43110f2d85327ac)
2. [Ssh-keygen is a tool for creating new authentication key pairs for SSH. This is a tutorial on its use, and covers several special use cases.](https://www.ssh.com/academy/ssh/keygen?msclkid=5c158a38c49711ec91acb0aebd4f9f18)

```learn
syntax: 'ssh-copy-id -i ~/.ssh/<key> user@host'
prompts:
  - q: Which command copies your public key into a remote host's authorized_keys?
    a: 'ssh-copy-id -i ~/.ssh/tatu-key-ecdsa user@host'
  - q: How do you generate an SSH key pair at a specific path?
    a: 'ssh-keygen -f /home/thor/.ssh/maria'
```
