---
aliases:
  - Teragrep queries
tags:
category: til
updated: 2026-08-25T14:30:56
---
## With earliest and latest

```teragrep

%dpl
index=example earliest=2020-01-01T00:00:00.000+03:00 latest=2021-12-01T00:00:00.000+03:00

```


## With keywords

```teragrep
%dpl
index=dns_audit earliest="2025-03-27T09:40:00+02:00" latest="2025-03-27T09:43:59+02:00" (3)sec(3)his(3)arc 10.45.128.162
```

---
# references:
[search :: Teragrep Docs](https://docs.teragrep.com/DPL/1.0.0/functions/transforms/search.html)