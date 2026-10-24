---
title: "Azure Functions"
slug: "azure-functions"
created: 2024-04-20T14:27:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "appservices"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754930121623465'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnfafzrn2m'
---
- serverless (can run with [Azure App Service#App Service Plan](/azure-app-serviceapp-service-plan))
	- I just write the code
- many languages supported
- Event driven such as HTTP, schedule, event grid, blob creation
- Binds to additional inputs and outputs

# Serverless
```mermaid
flowchart LR
Event -.-> |Trigger| Work
Work <--> |BindingOrConnection| Services
```
- Point of serverless is there is some work you want to do
- Which is triggered by some event (schedule, message, api, etc)
	- Can be many event sources (blob,app,etc) 
	- Which can be difficult to poll, etc.
	- So what we get is Event grid
		- which talks to all these sources and pushes the event to the event handler
		- Event handlers for example [Azure Functions](/til/azure-functions), webhooks, etc.
- That work is integrated with services
---
# references: