---
title: "File Permissions in Linux"
slug: "file-permissions-in-linux"
created: 2026-08-18T15:35:00+03:00
updated: 2026-08-25T14:47:43+03:00
category: til
tags: ["linux"]
---
Every file has a set of permissions (similar to ACLs in Windows) that determine whether a user can read, write or run that file. Running `ls -l` displays the permissions.

There are four parts to file's mode.
1. Type
2. User Permissions
3. Group Permissions
4. Other Permissions

The first character is type. `-` means its a file, `d` means directories. The rest of the file's mode contains permissions in groups of three, in order for user, group and other. We can also use octal forms for setting permissions.

r means file is readable (4)
w means file is writable (2)
x means file is executable (for scripts, etc.) (1)
`-` means nothing, i.e. no permissions set

```
## As an example
## some user has read-write
## members of somegroup have read
## others have read
-rw-r--r--  1 someuser  somegroup    64975 16 Oct  2018 somedoc.rtf
```

## Comparing against ACLs in NTFS
1. NTFS permissions are per-user permissions, multiple users can have different rights. Linux file mode has only three - user, group and others.
2. NTFS has explicit deny rules.
3. NTFS has inheritance model.
4. NTFS has auditing capability, Linux file mode does not having anything. Though, audit tools exist.