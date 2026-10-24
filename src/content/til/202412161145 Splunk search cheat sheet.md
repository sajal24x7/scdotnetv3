---
title: "Splunk Search Cheat Sheet"
slug: "splunk-search-cheat-sheet"
created: 2024-12-16T11:45:00+02:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["splunk"]
---
```text

# Bad password
index=winsecuritylogs, EventCode=4625, <user-account>

# Correct attempt
index=winsecuritylogs, EventCode=4624, <user-account>

```