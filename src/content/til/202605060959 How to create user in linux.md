---
title: "How to Create User in Linux"
slug: "how-to-create-user-in-linux"
created: 2026-05-06T09:59:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["linux", "user"]
---
```bash

# Use useradd or adduser
# useradd is a wrapper around adduser
# useradd is more interactive
# Requires sudo

useradd <username>

# To check use id or cat /etc/passwd
id <username>
cat /etc/passwd

## Create user with no interactive shell
adduser ravi -s /sbin/nologin

## To change login shell
usermod -s /usr/sbin/nologin <username>

## Create user with expiry date
useradd charmander -e 2026-12-20

## To check age
chage -l charmander

## To change expiry for existing user
chage -E 2027-12-20 charmander

```