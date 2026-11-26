---
title: Platform and Infrastructure Community Meetup November
slug: platform-and-infrastructure-community-meetup-november
created: 2026-11-25T14:16:00.000Z
updated: 2026-11-26T08:13:45.000Z
category: blog
tags:
  - meetup
  - pni-community
  - platform-engineering
description: Three interesting talks around platforms in the AI age
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117683770281666625'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n3a4ytm5zl2s'
  - 'https://www.threads.com/@sajal24x7/post/DgNkvR0m_Ur'
---
I am back at the Polar Squad office for the 2nd P&I community meetup. There’s some nice music in the air. And I do love this space, it’s both cosy and large enough. Plus I got a chair this time around so my back has plenty of support. Last time my back had ached by the end.

---
## From Linux Namespaces to MicroVMs: A Practical Guide to Al Agent Sandboxing, Vijay Kodam, Nokia

![First talk](https://storage.sajalchoudhary.net/images/2026/11/pnic-nov-01.jpeg)*Beginning the talk*

We need agents to run in a sandbox to ensure incidents don’t happen.

The problem is that AI workloads are not normal workloads. They are non-deterministic. So we should treat it by default as hostile.

There are five levels of isolation, in increasing order:
1. Prompts only - you tell it don’t read my creds for example. 
2. OS sandbox - shared kernel. The fence covers every process the agent starts - only bash and python. Off by default.
3. Container - shared kernel. Needs to be hardened. Without it, it can exfil any data it has access to. 
4. Separate Kernel - gVisor or microVM. A way to secure it is handing the agent dummy keys and the host proxy swaps the real key from the keychain and then the api request is formed. So agent never gets the actual key.
5. Separate Machine - like the VMs Anthropic runs

![Hardening is the key](https://storage.sajalchoudhary.net/images/2026/11/pnic-nov-02.jpeg)*Hardening is the key*

Hardening is the key. In all levels, with hardening exfil is difficult. Of course the boundaries have bugs too, so patch any CVEs.

A very good talk, just the right level of technical detail. 

---
## Scaling Developer Experience without a Platform Team, Niko Kivelä & Jacob Lartors, SOK

![Second talk](https://storage.sajalchoudhary.net/images/2026/11/pnic-nov-03.jpeg)*Second talk*

I had seen this talk in its previous form at a Devops Finland meetup at SOK. 

Internal platform is a sum of all tech and tools that platform engineering team binds together to build golden paths and enables developer self-service. Internal developer portal is a subset of that.

I love watching a thing get polished. Of course not the work itself but the end result across a period of time. Some visuals, some texts, change leading to better flow.

The relevant to me section was them deciding to use a toll for their internal developer portal but then deciding to build their own, in the age of AI. I am building something similar at work. The problem was you were constrained by whatever features the tool had. They wanted to offer more. I need to think similarly about these things. They built SOK platform.

With AI tools there are new challenges around access, budgets, visibility, etc. There are also things like agents, skills, etc. that needs to be shared with the developers.

![A sneak peek](https://storage.sajalchoudhary.net/images/2026/11/pnic-nov-04.jpeg)*A sneak peek into warehouse*

The main features -
1. AI tools for development
2. Communities
3. Knowledge Base - built on Bedrock vector DB

An interesting idea for budgets is that the team lead can manage budgets for their team members. 

---
## Running GenAl Apps in Production, Anoop Vijayan, Polar Squad

![Fourth talk](https://storage.sajalchoudhary.net/images/2026/11/pnic-nov-05.jpeg)*Fourth talk*

A nice walkthrough (with demos) of the evolution of the chat bot and also the things you need to do run a GenAI app in production.
1. starting as a chatgpt wrapper, 
2. then adding system prompts to it, 
3. then adding RAG to it to give it business context. 
4. Now, after all that you actually want it do something - take action. So then you get to MCP servers. The problem is MCP servers don’t have access control. 
5. So you add RBAC. Agent logs in as the user running it with whatever policies are allowed.
6. Now jailbreak/prompt injection. So then layered guardrails to fix this.
7. Now the cost. One approach is to have a semantic cache, so common questions are answered through the cache. Also a model router to route request to small or frontier models.
8. But you need more, better cost management - AI gateway - token limits, budgets etc. A dashboard fed by all this.
9. Observability is next. You want to track who has done what. 
10. Release management - versioning everything that changes the agents behaviour.

![A summary slide](https://storage.sajalchoudhary.net/images/2026/11/pnic-nov-06.jpeg)*A summary slide*

Also loved the slides - two colors (pink- hero here), mostly text simple graphs and diagrams. Wonderful structure to the talk.

---

Loved the event. All three talks were relevant (to me) and well presented. 
