---
tags:
  - splunk
aliases:
  - Splunk search cheat sheet
updated: 2026-08-25T14:30:56
---
```text

# Bad password
index=winsecuritylogs, EventCode=4625, T-CTM-YLE

# Correct attempt
index=winsecuritylogs, EventCode=4624, T-CTM-YLE

```