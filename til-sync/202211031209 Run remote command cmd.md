---
tag: #windows, #cmd
aliases:
---

1. Open cmd, admin.
2. 
```cmd
WMIC /node:<computername> process call create “cmd.exe /c GPUpdate.exe /force”
```

---
references:
[Run a command on a remote computer - Windows Forum - Spiceworks](https://community.spiceworks.com/how_to/127139-run-a-command-on-a-remote-computer#:~:text=How%20to%3A%20Run%20a%20command%20on%20a%20remote,Step%202%3A%20Run%20your%20command.%203%20References.%20)