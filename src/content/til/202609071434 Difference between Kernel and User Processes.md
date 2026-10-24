---
title: "Difference Between Kernel and User Processes"
slug: "difference-between-kernel-and-user-processes"
created: 2026-09-07T14:34:00+03:00
updated: 2026-09-07T14:35:47+03:00
category: til
tags: ["linux", "kernel"]
---
Kernel runs in **kernel mode**. Code running in kernel mode has unrestricted access to processor and main memory. This is super dangerous as kernel can crash the entire system.

User mode, restricts access to a subset of memory and safe CPU operations. This is comparatively safe, however, processes can still delete files if they have the access.