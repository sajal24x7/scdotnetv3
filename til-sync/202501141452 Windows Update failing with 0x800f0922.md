---
aliases:
  - Windows Update failing with 0x800f0922
tags:
  - "#windows"
  - "#update"
category: til
updated: 2026-08-25T14:30:56
---
0x800f0922 is a generic error meaning "the installer failed".
To understand the cause you need to skim though `%WinDir%\Logs\CBS\CBS.log` and find the first error that then triggers a cascade of failures culminating in 0x800f0922.

```text

2025-01-14 16:48:16, Info                  DPX    Extraction of file: update.ses failed because it is not present in the container (\\?\G:\9715922e905631fa733d804f01f7566c\x64-Windows10.0-KB4486129-x64.cab).
2025-01-14 16:48:16, Info                  DPX    DpxException hr=0x80070002 code=0x020109
2025-01-14 16:48:16, Info                  CBS    Not able to add file to extract: update.ses [HRESULT = 0x80070002 - ERROR_FILE_NOT_FOUND]
```

# To fix
1. Run windows update troubleshooter. Present her: `Control Panel\All Control Panel Items\Troubleshooting\System and Security`
2. Then, proceed based on findings.

## Fix windows update DB corruption errors

```powershell

DISM.exe /Online /Cleanup-Image /RestoreHealth /Source:\\10.47.17.44\c$\winsxs /LimitAccess

```

Restart the server

``` powershell
sfc /scannow

```



---
# references:
[PSA: Windows Update failing with 0x800f0922 - How to resolve : r/sysadmin](https://www.reddit.com/r/sysadmin/comments/zl7pbg/psa_windows_update_failing_with_0x800f0922_how_to/?rdt=55753)
[Additional resources for Windows Update - Windows Client | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-client/installing-updates-features-roles/additional-resources-for-windows-update)
[Fix Windows Update corruptions and installation failures - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/installing-updates-features-roles/fix-windows-update-errors)
[Guidance for troubleshooting Windows Update issues - Windows Client | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-client/installing-updates-features-roles/troubleshoot-windows-update-issues)