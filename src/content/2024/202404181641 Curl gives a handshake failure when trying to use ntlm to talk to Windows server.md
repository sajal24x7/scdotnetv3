---
title: Curl gives a handshake failure when trying to use ntlm to talk to Windows server
slug: curl-gives-a-handshake-failure-when-trying-to-use-ntlm-to-talk-to-windows-server
pubDate: '2024-04-18T16:41:00+03:00'
updatedDate: '2024-04-18T16:41:00+03:00'
category: til
tags:
- linux
- curl
- windows
- ntlm
- evergreen
---

This can happen if NTLM v1 is disabled on the target Windows environment.

# Issue
- Using curl to access a resource on Windows IIS (sharepoint, for example) gives "NTLM handshake rejected" error
- NTLM v1 can be disabled either via GPO or directly in the registry (details below)
- The default install of curl on RHEL does not support NTLMv2

## GPO
Network security > LAN manager authentication settings (among other settings)
## Registry: 

```text
Under 
HKEY_LOCAL_MACHINE\System\CurrentControlSet\control\LSA\MSV1_0

Value Name: NtlmMinClientSec  
Data Type: REG_WORD  
Value: one of the values below:

- 0x00000010- Message integrity
- 0x00000020- Message confidentiality
- 0x00080000- NTLM 2 session security
- 0x20000000- 128-bit encryption
- 0x80000000- 56-bit encryption
```

# Resolution
Upgrade curl on RHEL to enable the `httpd24-curl`.

```bash
# yum install httpd24-curl

# scl enable httpd24 bash

```

Curl versions will be different before and after.

```bash
Before:
# curl -V
curl 7.29.0 (x86_64-redhat-linux-gnu) libcurl/7.29.0 NSS/3.36 zlib/1.2.7 libidn/1.28 libssh2/1.4.3
Protocols: dict file ftp ftps gopher http https imap imaps ldap ldaps pop3 pop3s rtsp scp sftp smtp smtps telnet tftp 
Features: AsynchDNS GSS-Negotiate IDN IPv6 Largefile NTLM NTLM_WB SSL libz unix-sockets

After:
# curl -V
curl 7.47.1 (x86_64-redhat-linux-gnu) libcurl/7.47.1 NSS/3.28.4 zlib/1.2.7 libidn/1.28 libssh2/1.4.3 nghttp2/1.7.1
Protocols: dict file ftp ftps gopher http https imap imaps ldap ldaps pop3 pop3s rtsp scp sftp smb smbs smtp smtps telnet tftp 
Features: AsynchDNS IDN IPv6 Largefile GSS-API Kerberos SPNEGO NTLM NTLM_WB SSL libz HTTP2 UnixSockets
```

---
# references:
[Enable NTLM 2 authentication - Windows Client | Microsoft Learn](https://learn.microsoft.com/en-US/troubleshoot/windows-client/windows-security/enable-ntlm-2-authentication)
