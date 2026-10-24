---
title: "How to Disable Direct Ssh Root Login"
slug: "how-to-disable-direct-ssh-root-login"
created: 2026-05-28T15:18:00+03:00
updated: 2026-09-01T12:51:40+03:00
category: til
tags: ["linux", "ssh"]
---
1. Go to `/etc/ssh/sshd_config` file
2. Find the `PermitRootLogin` make it no to disable it.
3. Restart sshd service.