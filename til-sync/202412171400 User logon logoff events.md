---
tags:
  - "#windows"
  - "#ad"
aliases:
---
# Logon events

| Logon events | Description                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 4624         | A user successfully logged on to a computer. For information about the type of logon, see the Logon Types table below. |
| 4625         | Logon failure. A logon attempt was made with an unknown user name or a known user name with a bad password.            |
| 4634         | The logoff process was completed for a user.                                                                           |
| 4647         | A user initiated the logoff process.                                                                                   |
| 4648         | A user successfully logged on to a computer using explicit credentials while already logged on as a different user.    |
| 4779         | A user disconnected a terminal server session without logging off                                                      |

# Logon type

| Logon type | Logon title       | Description                                                                                                                                                                                                                                                                                                                |
| ---------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2          | Interactive       | A user logged on to this computer.                                                                                                                                                                                                                                                                                         |
| 3          | Network           | A user or computer logged on to this computer from the network.                                                                                                                                                                                                                                                            |
| 4          | Batch             | Batch logon type is used by batch servers, where processes may be executing on behalf of a user without their direct intervention.                                                                                                                                                                                         |
| 5          | Service           | A service was started by the Service Control Manager.                                                                                                                                                                                                                                                                      |
| 7          | Unlock            | This workstation was unlocked.                                                                                                                                                                                                                                                                                             |
| 8          | NetworkCleartext  | A user logged on to this computer from the network. The user's password was passed to the authentication package in its unhashed form. The built-in authentication packages all hash credentials before sending them across the network. The credentials do not traverse the network in plaintext (also called cleartext). |
| 9          | NewCredentials    | A caller cloned its current token and specified new credentials for outbound connections. The new logon session has the same local identity, but uses different credentials for other network connections.                                                                                                                 |
| 10         | RemoteInteractive | A user logged on to this computer remotely using Terminal Services or Remote Desktop.                                                                                                                                                                                                                                      |
| 11         | CachedInteractive | A user logged on to this computer with network credentials that were stored locally on the computer. The domain controller was not contacted to verify the credentials.                                                                                                                                                    |

---
# references:
[Audit logon events - Windows 10 | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/basic-audit-logon-events)