---
tags:
  - "#cert"
aliases:
  - How to create stacked certificates
category: til
---

Stacked cert should be in this order:

``` text
Server -->  intermediary --> root
```

For NTP meinberg appliance, add private key after server

```text
Server --> Private key -->  intermediary --> root
```