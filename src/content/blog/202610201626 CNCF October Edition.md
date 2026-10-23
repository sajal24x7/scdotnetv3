---
title: CNCF October Edition
slug: cncf-october-edition
created: 2026-10-20T13:26:00.000Z
updated: 2026-10-20T20:00:14.000Z
category: blog
tags:
  - cncf
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117475919030078543'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mydtazt4lf2j'
  - 'https://www.threads.com/@sajal24x7/post/DevDeN-oC57'
---
My first time at Verda office in Helsinki. This is just the building across the road from the Oodi library. I had not given it a second look before today. I mean, it was just another building on my way to Oodi. Now, it's Verda's offices!

Svitlana had the intro slides.

![Intro slides](https://storage.sajalchoudhary.net/images/2026/10/cncf-oct-01.jpeg)*Intro slides*

![About verda](https://storage.sajalchoudhary.net/images/2026/10/cncf-oct-02.jpeg)*Intro about the host*
## Serverless inference on Kubernetes

![Intro slide first talk](https://storage.sajalchoudhary.net/images/2026/10/cncf-oct-03.jpeg)*Intro slide first talk*

The problem - Inference traffic comes in bursts - idle GPU is wasted money. Scaling to zero causes cold starts.

Serverless inference means user provides the image and they get an endpoint. 


![Serverless architecture](https://storage.sajalchoudhary.net/images/2026/10/cncf-oct-04.jpeg)*Serverless architecture*

Two types - 
1. Real-time sync and async
2. Batch Jobs

When nothing is running, KEDA scales to zero. The endpoint, queue and metadata remain alive. Queue system (NATS) holds requests until a replica is ready.
### Cold starts
First we check if GPU is available.
Then you pull the container image - images are large, so it’s a slow pull. Kubernetes prefers nodes that already have the image available. So that’s good.
Loading models takes time.
Then comes starting the inference engine. We need to wait for when the system is ready.

### Scaling 
GPU utilisation is a bad signal. Scaling on queue depth and concurrency. Up to you to decide min/max replicas - cost vs performance. 

![Demo](https://storage.sajalchoudhary.net/images/2026/10/cncf-oct-05.jpeg)*Demo*

Finally a live demo which showed scaling from cold start as requests came in and eventual scale down when the requests dried up.

---

It was a wonderful event with great talks - though I missed the second one. I had to leave early.
