---
title: Platespin Install
slug: platespin-install
pubDate: '2022-09-26T12:55:00+03:00'
updatedDate: '2022-09-26T12:55:00+03:00'
category: til
tags: []
---


# Automated

If proxy is enabled. Then run the powershell script.

# Manual

1.  Installing Visual C++ 2013. To install VC++ 2013 on the planned Migrate server:
	1.  Extract the PlateSpinMigrateSetup-2019.5.0.x.exe to a location on the planned server host for PlateSpin Migrate.
	2.  In a file browser, navigate to the ..\Migrate-2019_5\PlateSpinImage\VCruntime-x64 folder.
	3.  Run vcredist_x64.exe as Administrator.

2.  Installing SQL Server Native Client
	1. Download: [https://www.microsoft.com/en-us/download/details.aspx?id=50402](https://www.microsoft.com/en-us/download/details.aspx?id=50402)
	2. And install.

3.  Install dot net core
	1. Download: [https://download.visualstudio.microsoft.com/download/pr/a46ea5ce-a13f-47ff-8728-46cb92eb7ae3/1834ef35031f8ab84312bcc0eceb12af/dotnet-hosting-2.2.3-win.exe](https://download.visualstudio.microsoft.com/download/pr/a46ea5ce-a13f-47ff-8728-46cb92eb7ae3/1834ef35031f8ab84312bcc0eceb12af/dotnet-hosting-2.2.3-win.exe)
	2. And install.

4.  Now run the script for pre-requisite to install everything.
---
references:
https://www.microfocus.com/documentation/platespin/platespin-migrate-2019-5/migrate-install/install-prereq-sw.html#silent-install-vcplusplus](https://www.microfocus.com/documentation/platespin/platespin-migrate-2019-5/migrate-install/install-prereq-sw.html#silent-install-vcplusplus)