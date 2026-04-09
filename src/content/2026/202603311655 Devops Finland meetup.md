---
title: Devops Finland meetup
slug: devops-finland-meetup
pubDate: 2026-04-09T19:34:03.000Z
updatedDate: 2026-04-09T19:34:03.000Z
category: blog
tags:
  - devops
  - finland
  - meetup
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116376424555085180'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mj3kitqh5m25'
  - 'https://www.threads.com/@sajal24x7/post/DW7D-Ock8nw'
---
## The space
The meetup was at the Hoxhunt offices near Ruoholahti. I decided to park at home and then go back using public transport. I could not find any OK parking place near the venue and it was far away that I couldn’t just walk from the place.

Hoxhunt have a nice space. As soon as I entered I noticed the Table Tennis table kept to a side. There were a few people sitting around what I assumed was the presentation area. There were two rows of black plastic chairs kept on the ground and then steps for people to sit, covered in a blue fabric. The top most level of the steps had cushions against the wall, so I took a place there.

![TT table](https://storage.sajalchoudhary.net/images/2026/03/df-2026-03-04.jpeg)

I picked some pizza and drinks next. They had four different kinds for vegans/vegetarians.

And then, as I finished typing these lines, I looked up and it was time for the first talk of the evening.

![Intro](https://storage.sajalchoudhary.net/images/2026/03/df-2026-03-01.jpeg)
## Dangers in Kubelet permissions / Martti Leppänen, Director of Platform Engineering @Hoxhunt

![Kubelet permissions](https://storage.sajalchoudhary.net/images/2026/03/df-2026-03-02.jpeg)

How things are not as innocuous as they seem. The good news was that this vulnerability was fixed in latest releases.

# Terraform Blocks You Don't Know / Lauri Suomalainen, Head of Cloud Development @ Teamit

![Unknown terraform blocks](https://storage.sajalchoudhary.net/images/2026/03/df-2026-03-03.jpeg)

- Provisioner
- Ephemeral - used to create temp resources. Not stored in state, does not show up in plan files.
- Check - check on outside conditions. Failing does not block plans or applies. Use postconditions if you require operations to be blocked on failure.
- Dynamic - create multiple nested blocks in a resource.
- Import - instead of running import in cli.
- List
- Moved - rename a resource.
- Removed - to remove a resource you don’t want to use. With lifecycle destroy=false. Just replace the resource block with removed.
- testing 

And finally about terraform stacks - which I did not understand much.
