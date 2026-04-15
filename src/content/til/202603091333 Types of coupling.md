---
title: Types of coupling
slug: types-of-coupling
pubDate: 2026-03-09T12:18:43.000Z
updatedDate: 2026-03-09T12:18:43.000Z
category: til
tags:
  - micro-services
  - architecture
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116199188731156768'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mgmttcseib2h'
  - 'https://www.threads.com/@sajal24x7/post/DVqfpPxjlcp'
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
