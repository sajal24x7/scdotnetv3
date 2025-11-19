---
title: "Cloudflare explains Tuesday’s outage"
slug: "cloudflare-explains-tuesdays-outage"
pubDate: 2025-11-19T08:09:27+02:00
updatedDate: 2025-11-19T08:09:27+02:00
category: micro
tags:
  - cloudflare
  - outage

---
[Cloudflare explains Tuesday’s outage that temporarily took down ChatGPT by Richard Lawler](https://www.theverge.com/news/823711/cloudflare-outage-postmortem)

> the query change caused its ClickHouse database to generate duplicates of information. As the configuration file rapidly grew to exceed preset memory limits, it took down “the core proxy system that handles traffic processing for our customers, for any traffic that depended on the bots module.”

My website is hosted on Cloudflare pages. It was down for a bit. As were a bunch of other websites - udemy, safari (o’Reilly) and so on.

It seems like a bad time for these cloud providers. First it was AWS, then Azure, then Azure had a DDoS attack and now this.

It truly seems like a matter of when and not if.