---
title: How to Change Shell in Linux
slug: how-to-change-shell-in-linux
created: 2026-08-23T11:25:00.000Z
updated: 2026-08-23T11:27:34.000Z
category: til
tags:
  - linux
  - bash
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117146970252802112'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mtrqmgzs7y2p'
  - 'https://www.threads.com/@sajal24x7/post/DcZdzR2CRZt'
---
```bash
# To list available shells
cat /etc/shells

# To list current shell
echo $SHELL

# To change shell
chsh --shell /bin/sh username
```
