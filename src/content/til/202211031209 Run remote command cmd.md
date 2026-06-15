---
title: Run Remote Command Cmd
slug: run-remote-command-cmd
created: '2022-11-03T12:09:00+03:00'
updated: '2022-11-03T12:09:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754722879931805'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkgyhnll2v'
  - 'https://www.threads.com/@sajal24x7/post/DZnF6NDltna'
---


1. Open cmd, admin.
2. 
```cmd
WMIC /node:<computername> process call create “cmd.exe /c GPUpdate.exe /force”
```

---
references:
[Run a command on a remote computer - Windows Forum - Spiceworks](https://community.spiceworks.com/how_to/127139-run-a-command-on-a-remote-computer#:~:text=How%20to%3A%20Run%20a%20command%20on%20a%20remote,Step%202%3A%20Run%20your%20command.%203%20References.%20)
