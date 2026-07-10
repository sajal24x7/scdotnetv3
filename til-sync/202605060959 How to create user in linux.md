---
tags:
  - linux
  - user
aliases:
  - How to create user in linux
category: til
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