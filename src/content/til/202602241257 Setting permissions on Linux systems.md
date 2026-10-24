---
title: "Setting Permissions on Linux Systems"
slug: "setting-permissions-on-linux-systems"
created: 2026-02-24T12:57:00+02:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["linux", "filesystem"]
---
```bash

## Permissions
# r - read
# w - write
# x - execute

## To add
chmod u+r <filepath>
chmod g+r <filepath>
chmod o+r <filepath>

## To remove
chmod u-r <filepath>
chmod g-r <filepath>
chmod o-r <filepath>

## To give exact permissions
chmod u=r <filepath>
chmod g=r <filepath>
chmod o=r <filepath>

## Use commas, for multiple permissions in one go on a file
chmod u=r,g-r, o=x <filepath>

```

I think I prefer the exact permissions method. Also chown to change ownership of the file.