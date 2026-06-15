---
title: FAUG Zero to Hero Meetup
slug: faug-zero-to-hero-meetup
created: 2026-03-19T19:21:29.000Z
updated: 2026-03-19T19:21:29.000Z
category: blog
image: https://storage.sajalchoudhary.net/images/2026/03/faug-2026-march-08.jpeg
tags:
  - faug
  - azure
  - meetup
  - finland
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116257468489973412'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mhgpzuvdsm2c'
  - 'https://www.threads.com/@sajal24x7/post/DWE95LVkiZB'
---
I had fun attending the Zero to Hero FAUG event at Microsoft campus in Keilaniemi. Around 130 people had registered for the event, but there were a few no-shows. I was going to be one of those, not no-shows, but rather cancelled a day-befores. I was not sure what this event would have for me, but I decided to go. Prerna was going anyway and just last night I saw the post from FAUG on Linkedin, and somehow it made me want to go.

![P&S](https://storage.sajalchoudhary.net/images/2026/03/faug-2026-march-07.jpeg)

There were five talks covering data, app development, infra, security and the state of azure, with a snack break thrown after the app dev talk.

Sakari started the event off in his usual charming style. The takeaway from his talk was the [Azure heat map](https://azurecharts.com/heatmap) which shows a dynamic map of services Microsoft updates. 

Vesa was next, and he talked about new-to-me [One Lake](https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview) and how it acts as the backbone for a bunch of data services. He ended with his trademark - did you learn something. 

Next up was Jouni, who had a bunch of interesting questions and answers about this new Agentic Engineering future we all are living in now. The takeaway for me was [Azure SRE Agent](https://azure.microsoft.com/en-us/products/sre-agent) - which is not ready yet, but is evolving.

Then we broke for snacks - a sandwich and some coffee.

![Lunch](https://storage.sajalchoudhary.net/images/2026/03/faug-2026-march-04.jpeg)

Jukka was up next, talking about the thing that is in my wheelhouse - infra. He talked about Developer Landing Zones which let developers work in a heavily regulated industry and with a little bit of burden on them to figure out network stuff.

At last, we had a talk by Jussi, which was ostensibly about security, but actually about being a good person to work with. That was my takeaway from this talk, that and keep growing, learning and building new things.

We rushed out of the venue then as we were a bit late to pick Savya from his paivakoti.

---
## Opening by Sakari Nahi

![Sakari](https://storage.sajalchoudhary.net/images/2026/03/faug-2026-march-01.jpeg)
- State of Azure, but mostly AI
- if I’m coding, I want an agent planning. If they’re coding, I want to be reviewing.
- Talked about AI coding approaches - vibe coding, spec-driven, context and harness engineering.
- Microsoft Foundry enables these approaches (other than vibe-coding)
- Learn Foundry
- Azure heat map is interesting to track it shows the services Microsoft is updating

## Data by Vesa Tikkanen

![Vesa](https://storage.sajalchoudhary.net/images/2026/03/faug-2026-march-02.jpeg)

- you can not pick up one tool and be done, instead learn about general tools and metrics that matter to your organisation.
- Core mathematical skills are not going anywhere
- Learn Microsoft Fabric
- One Lake has capability to integrate with different sources including on prem, sql db, etc. Once data is in one lake, it can be shared with everything - fabric, ai, etc.
- Delta-Parquet is the common format in which all data is saved
- Mirroring copies data from source to one lake
- Shortcut is like a symlink to other sources. AI transformations are directly built into OneLake.

## App by Jouni Heikniemi

![Jouni](https://storage.sajalchoudhary.net/images/2026/03/faug-2026-march-03.jpeg)
- You’re going to be even more full stack than before
- loves nethack, keeps rebuilding it - to learn new languages. Now with Agentic Engineering. 
- Spec-driven development - tell what you want in markdown.
- can cause Feature slop - you create all the features.
- Every feature is a maintenance liability. Saying no is a core engineering skill now.
- Pencil.dev for ux design 
- Azure SRE agent - to help with ops. Not ready yet, but evolving.

## Infra by Jukka Koskelin

![Infra](https://storage.sajalchoudhary.net/images/2026/03/faug-2026-march-05.jpeg)

- plenty of authorities determine the regulations we need to follow - dora and then other baselines and frameworks.
- the one talk that was perhaps more in my wheelhouse

## Security by Jussi Roine

![Jussi](https://storage.sajalchoudhary.net/images/2026/03/faug-2026-march-06.jpeg)

- things changed - ID, data, decisions went to the cloud
- we need to understand what the business does/wants
- when transition happens - be in the room where decisions are being made - how are ids managed, how to maintain compliance during cutover, etc.
- your job is to translate business asks into things you implement
