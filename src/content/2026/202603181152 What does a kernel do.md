---
title: "What does a kernel do"
slug: "what-does-a-kernel-do"
pubDate: 2026-03-18T11:55:49+02:00
updatedDate: 2026-03-18T11:55:49+02:00
category: til
tags:
  - linux
  - os
  - kernel

---
Generally, a kernel manages task in four general areas -
1. Processes - what process is allowed to run in the CPU 
2. Memory - what is allocated to a process, what is shared, what is free
3. Device drivers - kernel operates the hardware, acting as interface 
4. System calls and support - Processes use system calls to communicate with the kernel

From [How Linux Works](/bookshelf/how-linux-works).