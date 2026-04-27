---
title: Raise a Certificate Request on Windows
slug: raise-a-certificate-request-on-windows
pubDate: '2022-05-20T09:55:00+03:00'
updatedDate: '2022-05-20T09:55:00+03:00'
category: til
tags:
- windows
- cert
---


# Script
1. Ensure that you have the configuration name correct. Just run **certutil** and copy the CA Config name from the output.
2. Multi cert script developed.

# Manual

1. Open mmc. File > Add/Remove Snapin. Add Certificates. Select Computer Account.
2. Go to Certificates > Personal.
3. Right Click > All Tasks > Advanced Operations > Create Custom Request.
4. Next. Next.
5. On Custom Request page, Select Web Server as template. Next.
6. On Certificate Information page, expand by clicking icon next to Details. Click on Properties.
7. In Subject tab. Subject Name: select type as Common Name. In value field, put the required DNS value (fitcs.fi.tcsecp.com). Click Add.
8. In Alternative Name, select DNS and as value put the same thing as above (fitcs.fi.tcsecp.com). Click Add.
9. In General tab, put Friendly name, and description.
10. In Private key tab, expand Key options, select "Make Private key exportable" option. Click apply. Click OK.
11. Click Next. Select a location for the generated file. Name the file. Click Save. Click Finish. File will be generated at the location you selected.
12. If you need private key as well, go to Certificate Enrollment Requests > Certificates. You will find the cert here.
13. Right click on the cert. All Tasks > Export. Next.
14. Select Yes, Export the private key. Next.
15. Click on the Password option, provide the password. Click Next.
16. Select the location for the private key and press next.
17. Verify the details on the page and click finish. Key will be generate at the mentioned location.

---
references:
[How to generate Certificate Signing Request using Microsoft Management Console (MMC) on Windows 2012 (entrust.com)](https://www.entrust.com/knowledgebase/ssl/how-to-generate-certificate-signing-request-using-microsoft-management-console-mmc-on-windows-2012)