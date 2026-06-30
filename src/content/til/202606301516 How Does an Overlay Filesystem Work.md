---
title: How Does an Overlay Filesystem Work
slug: how-does-an-overlay-filesystem-work
created: 2026-06-30T12:21:49.000Z
updated: 2026-06-30T12:21:49.000Z
category: til
tags:
  - linux
  - file-system
  - docker
  - container
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116839032944871499'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mpiykrmgyl2t'
  - 'https://www.threads.com/@sajal24x7/post/DaNbpcNGy_M'
---
An Overlay Filesystem is used by Docker and other container technologies to combine multiple directories in one view.

There are three parts to it -
1. Lower
2. Upper
3. Mount

Any changes to the mount directory are really written to the upper directory by copying the changed file to the upper from lower. This way lower is never changed. Deletions are written to the upper directory as metadata.
