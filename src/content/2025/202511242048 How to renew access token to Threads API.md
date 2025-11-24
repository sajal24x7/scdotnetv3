---
title: "How to renew access token to Threads API"
slug: "how-to-renew-access-token-to-threads-api"
pubDate: 2025-11-24T20:54:28+02:00
updatedDate: 2025-11-24T20:54:28+02:00
category: til
tags:
  - git
  - facebook
  - threads

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