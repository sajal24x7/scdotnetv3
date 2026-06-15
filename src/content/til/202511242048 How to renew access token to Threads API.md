---
title: How to Renew Access Token to Threads API
slug: how-to-renew-access-token-to-threads-api
created: 2025-11-24T18:54:28.000Z
updated: 2025-11-24T18:54:28.000Z
category: til
tags:
  - git
  - facebook
  - threads
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/115606196422448533'
  - 'https://bsky.app/profile/sajal24x7.bsky.social/post/3m6fivmtdsl2p'
  - 'https://www.threads.com/@sajal24x7/post/DRczYWWkb6y'
---
I use a Github workflow to sync content to Threads, Mastodon and Bluesky. 

Mastodon and Bluesky do not require any weird things - you set them up once and they are done.

For threads though the access token expires every 60 days.

The steps to renew it are as follows:
1. Go to the [FB developers website.](https://developers.facebook.com/apps/) and find the app you created for the integration. Open the app.
2. On dashboard, there is an option to 'Customize the Access the Threads API use case'. Click that.
3. Go to settings in the next window.
4. There is a user token generator at the very end of the page, with an action called 'Generate Access token'.
5. Click it. It will open a new window, authenticate to Threads and then it will generate a new access token.
6. Copy this token and add it to the secrets on Github Actions.
