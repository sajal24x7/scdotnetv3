---
title: Linux Add Path to $Path
slug: linux-add-path-to-$path
pubDate: '2022-05-25T11:25:00+03:00'
updatedDate: '2022-05-25T11:25:00+03:00'
category: til
tags:
- linux
---


# Gotcha
The `/etc/profile` is executed only for interactive shells and the `/etc/bashrc` is executed for both interactive and non-interactive shells. In fact in Ubuntu the `/etc/profile` calls the `/etc/bashrc` directly.

# Temporarily
```bash
export PATH=/home/dave/work:$PATH
```

# For your self only
Add the export command above to .bashrc or .profile

# Permanent for all users
Add export to /etc/profile file and /etc/bashrc

```bash
export PATH=$PATH:/usr/local/bin
```

---
references:
1. [Understanding a little more about /etc/profile and /etc/bashrc - Benjamin Cane (bencane.com)](https://bencane.com/2013/09/16/understanding-a-little-more-about-etcprofile-and-etcbashrc/#:~:text=The%20%2Fetc%2Fprofile%20file%20is%20not%20very%20different%20however,PS1%20for%20all%20shell%20users%20of%20the%20system.)