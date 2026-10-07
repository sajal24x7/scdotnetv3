---
title: "FAUG October Meetup"
slug: "faug-october-meetup"
created: 2026-10-07T17:00:00+03:00
updated: 2026-10-07T21:45:18+03:00
category: blog
tags: ["faug", "azure", "meetup", "helsinki"]
---
I don't know how to start these posts. Another meetup event with notes that follow.

No Sakari Nahi today in the meetup. Over the two breaks - one before and one after the first two talks were done, I managed to talk to four different sets of people. 

It's never easy. I am not this person who goes out and cheerfully talks to people. But I do like getting diverse perspectives. So, of course, even though it's not pleasant (in the sense I would very much enjoy being at home on my PS5) I still want to do this. More of this.

---

I have been to enough of these events now that the venues repeat. I was back at the Elisa office, but not the same place I was at for an earlier vibe-coding meetup. I was going in the same direction, when some people asked me to go to the main office. 

The food was unique - Vietnamese cuisine - a make your own meal station. I liked it. 

![A bao](https://storage.sajalchoudhary.net/images/2026/10/faug-oct-01.jpeg)

---
## Automation for Directors - Jukka Alapiha, Elisa Oyj

![AI dev at Elisa](https://storage.sajalchoudhary.net/images/2026/10/faug-oct-02.jpeg)

A funny thing happened as Jukka started his talk. He mentioned they have freedom to try things out in terms of AI development in Elisa. That nobody is telling them what to do. And I thought, but is that good? I am reading [Inside the Box](/bookshelf/inside-the-box) right now, and one of the first stories in the book is about how constraints are good and so on.

Back to the talk then.

It’s about creating an agent skill and giving it data access so that it can find the information that the manager needs. Followed by a demo of getting subscription usage from Azure.

## Beyond no Return: Preparing your organization for Cyber War - Miska Kytö, Zure 

![Hello Miska](https://storage.sajalchoudhary.net/images/2026/10/faug-oct-03.jpeg)

An encore! I heard the talk last at [Azure and Friends september meetup](/blog/azure-and-friends-september-event). I don’t think there will be anything new in this one. So let’s see.

## Azure Virtual Desktop: Tips & Tricks - Joni Nieminen, Not Bad Security Oy

![About AVDs](https://storage.sajalchoudhary.net/images/2026/10/faug-oct-04.jpeg)

We start with a slide on the differences between AVD and M365 offerings. If you want more control you go with AVDs, basically. Classic difference between Saas and IaaS.

Then about five design decisions for AVDs -
1. How a user logs in - Entra ID
2. Networking
3. Profiles - persistent disk etc.
4. Images
5. Scaling

Pooled vs personal host pools - personal each user gets a single machine. Costs more.

Use IaC to manage it - obviously.

As a consultant, AVDs are excellent, so that you don’t have any data leakage. Data must stay with the customer. If the customer does not have a conditional access policy for trusted devices then you could use your machine to connect to different customer AVDs.

There are ways to save on costs, like - multi-session, scaling to work days, start vm on connect, reservations, m365 licensing, and right-sizing.

Key takeaways are to choose per user group, no click ops and rebuild hosts, don’t patch them.

---

I enjoy taking a picture of the surroundings in the city after I leave the venue. This time I took a picture of this play area in one of the building complexes.

![After](https://storage.sajalchoudhary.net/images/2026/10/faug-oct-05.jpeg)