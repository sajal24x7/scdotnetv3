---
tags:
  - linux
  - filesystem
aliases:
category: til
updated: 2026-08-25T14:30:56
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