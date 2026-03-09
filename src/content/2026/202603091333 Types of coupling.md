---
title: "Types of coupling"
slug: "types-of-coupling"
pubDate: 2026-03-09T14:18:43+02:00
updatedDate: 2026-03-09T14:18:43+02:00
category: til
tags:
  - micro-services
  - architecture

---
In the context of micro-services architecture, learned from [Building microservices.](/bookshelf/building-microservices)

## Domain coupling
One service needs to interact with a different service. This is mostly unavoidable. 

## Passthrough coupling
One service passes data to a different service, because the data is needed by the other service further downstream. It can be problematic because if they need it in a different format or need different items, than we may need to make changes as well.

## Common coupling
In common coupling two of more services use a common data source. Not desirable.

## Content coupling
Very similar to common coupling, the difference is that the external system can directly make changes to the internal state. Should be avoided.