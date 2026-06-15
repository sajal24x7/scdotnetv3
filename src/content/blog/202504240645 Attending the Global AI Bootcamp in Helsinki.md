---
title: Attending the Global AI Bootcamp in Helsinki
slug: attending-the-global-ai-bootcamp-in-helsinki
created: 2025-04-24T06:45:53.000Z
updated: 2025-04-24T06:45:53.000Z
category: blog
tags:
  - blog
  - microsoft
  - AI
image: 'https://storage.sajalchoudhary.net/images/2025/04/IMG_1130.jpeg'
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754253522967381'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3moddrld7kx2m'
---
I attended the [Global AI Bootcamp](https://globalai.community/badges/88df1dfa-8a1d-4203-80cc-7993a2320d21/) at the Microsoft office in Espoo on the 23rd April. It was a good session, centred around understanding and building agents. These sessions have been happening around the world in March, but here in Finland it was arranged in April.

The Microsoft office is located at Keilalahdentie 2, in one of the three towers, Tieto and Fortum also have their offices here.

![](https://storage.sajalchoudhary.net/images/2025/04/IMG_1136.jpeg)

There was a little notice on a board pointing to the direction where the event would be hosted, just to the right of the lobby.

![](https://storage.sajalchoudhary.net/images/2025/04/IMG_1135.jpeg)

![](https://storage.sajalchoudhary.net/images/2025/04/IMG_1129-1.jpeg)

![](https://storage.sajalchoudhary.net/images/2025/04/IMG_1128.jpeg)

![](https://storage.sajalchoudhary.net/images/2025/04/IMG_1127.jpeg)

![](https://storage.sajalchoudhary.net/images/2025/04/IMG_1125.jpeg)

![](https://storage.sajalchoudhary.net/images/2025/04/IMG_1114.jpeg)

Microsoft has a handsome office. The interiors are good. As I walked on, I came across a door with a bell. I rang it and walked in. This area had a few meeting rooms, a break room and the big conference room.

There was a door in the front, where the organisers were, I entered through there and as I walked in, I saw there was no wall at the end. It was open, with a few lounge chairs at the end, merging seamlessly with the break room. I loved the design. But why would you have doors in the front? Structural integrity?

The event was hosted by Vesa Tikkanen, Anna Silvonen and Vesa Nopanen.

![](https://storage.sajalchoudhary.net/images/2025/04/IMG_1118.jpeg)

There was a 20 min pre-shot video at the top followed by slides and demo sessions. Then we broke for lunch and returned for the big create your own agent hands-on.

It was a fun session. I learned a few things.

* * *

#### Three things to think about when building agents:

  1. **Memory**  which is basically the context you provide the agent.
  2. **Entitlements**  which are the permissions the agent has.
  3. **Actions**  which is about tools use, the things the agent can do.

* * *

#### All LLMs understand are tokens

Everything is a token. Things like space, case, special characters, change the token. It all determines what you get back.

You put n tokens in get 1 token out. The next token is a probability. All an LLM does is predict the next most likely token.

Test at [Open AI platform.](https://platform.openai.com/tokenizer)

The number of times a word appears in the training data, leads to it becoming a token. So, if `DefaultCellStyle` appears many times in the training data it becomes a single token. \(This example in 3.5\)

Encoders create tokens. There are rules, so for example three numbers is one token.

* * *

#### Types of generative AI applications

  1. Without RAG \(No data source\)
  2. With RAG \(With data sources - sharepoint, AI search, etc.\)
  3. With Agents \(With knowledge sources and tools to automate processes\)
  4. With multiple agents \(data agent, booking agent, hr agent, etc.\)
     1. Agents only perform specified actions
