---
title: "How to Install Multipass on Mac"
slug: "how-to-install-multipass-on-mac"
created: 2026-08-17T21:36:00+03:00
updated: 2026-08-17T21:43:09+03:00
category: til
tags: ["linux", "ubuntu", "multipass"]
---
Multipass is a Canonical utility to run VMs on the Mac. It uses Mac's default hypervisor so has better performance than say VirtualBox.

```bash
# Install multipass using homebrew
brew install multipass

# To test
multipass --version
```