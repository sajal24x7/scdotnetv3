---
title: Three-Tier CA Setup
slug: three-tier-ca-setup
created: '2022-04-28T14:21:00+03:00'
updated: '2022-04-28T14:21:00+03:00'
category: til
tags:
  - cert
  - internalca
  - powershell
  - windows
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhnzj6al24'
---


# Architecture
Root CA (1 | offline | workgroup)
Intermediary CA (1 | offline | workgroup)
Issuers (2 | In domain | clustered)

# PowerShell Commands
## Install
```powershell
Install-WindowsFeature ADCS-Cert-Authority
```
```powershell
Install-AdcsCertificationAuthority -CAType "EnterpriseSubordinateCA" -CACommonName "vKernelRO Issuing Certification Authority 01" -CADistinguishedNameSuffix "DC=vKernelRO,DC=RO" -KeyLength 4096 -HashAlgorithmName SHA256 -CryptoProviderName "RSA#Microsoft Software Key Storage Provider"  -DatabaseDirectory "D:\CAdb"  -LogDirectory "D:\CALogs"Implementing a three-tier CA Hierarchy
```
## Uninstall
```powershell
Uninstall-WindowsFeature ADCS-Cert-Authority
```
```powershell
Uninstall-AdcsCertificationAuthority
```

1. Create **CAPolicy.inf** in C:\Windows
```
[Version]
Signature=$Windows NT$"

[certsrv_server]
Renewalkeylength=2048
RenewalvalidityPeriodUnits=20
RenewalvalidityPeriod=years

CRLPeriod=Years
CRLPeriodUnits=2
CRLOverlapPeriod=Years
CRLOverlapUnits=1
CRLDeltaPeriodUnits=0
CRLDeltaPeriod=days

DiscreteSignatureAlgorithm=1
```
2. Install AD Certificate services role.


	![[Pasted image 20220428143118.png]]

![[Pasted image 20220428143029.png]]


# Root CA
1. Create CAPolicy.inf under C:\Windows
``` text
[Version]
Signature=$Windows NT$"

[certsrv_server]
Renewalkeylength=2048
RenewalvalidityPeriodUnits=20
RenewalvalidityPeriod=years

CRLPeriod=Years
CRLPeriodUnits=2
CRLOverlapPeriod=Years
CRLOverlapUnits=1
CRLDeltaPeriodUnits=0
CRLDeltaPeriod=days

DiscreteSignatureAlgorithm=1
```
2.  Install AD CS role.
```powershell
Install-WindowsFeature ADCS-Cert-Authority -IncludeManagementTools
```
3. Configure ADCS .
```powershell
Install-AdcsCertificationAuthority -CAType "StandaloneRootCA" -CACommonName "Finland TCSECP RootCA" -CADistinguishedNameSuffix "DC=fi,DC=tcsecp,DC=com" -KeyLength 2048 -HashAlgorithmName SHA256 -CryptoProviderName "RSA#Microsoft Software Key Storage Provider"  -DatabaseDirectory "D:\CA\CertDB"  -LogDirectory "D:\CA\CertLogs"  -ValidityPeriod Years  -ValidityPeriodUnits 20
```
4. Configure publication points and certificates validity period for the Root CA.
	1. Open the **Certification Authority** console, right-click the CA name and choose **Properties**. 
	2. Once the **Properties** window opens, go to the **Extensions** tab and remove all the locations from the list except the first one, by selecting them one by one and clicking the **Remove** button.
	3. Then add the url (http://pki.fi.tcsecp.com/crl/RootCA.crl) for the web server as publication point. Never use the HTTPS protocol for CRT/CRL file retrieval because is not going to work. CryptoAPI will permanently fail to fetch HTTPS URLs. check the box **Include in the CDP extension of issued certificates**.
	4. Move to the AIA extension by clicking the **Select extension** drop-down box. As before, remove all the locations in the list except the first one, then hit the **Add** button to add the new location (http://pki.fi.tcsecp.com/crl/RootCA.crt) for the root CA certificate. Once added, don’t forget to check the box **Include in the AIA extension of issued certificates**. Click **OK** then **Yes** to restart the **Certificate Services** service.
5. Make our root CA issue certificates valid for 10 years
```cmd
certutil -setreg ca\ValidityPeriodUnits 10
certutil -setreg ca\ValidityPeriod "Years"
net stop certsvc
net start certsvc
```
6. Copy certs from **%Windir%\System32\Certsrv\Certenroll** to the Webserver path mentioned in the step above. Rename as needed to Root.crl and Root.crt.


# Policy CA
1. Create CAPolicy.inf under C:\Windows
```text
[Version]
Signature=$Windows NT$"
 
[certsrv_server]
Renewalkeylength=2048
RenewalvalidityPeriodUnits=10
RenewalvalidityPeriod=years
 
CRLPeriod=Years
CRLPeriodUnits=2
CRLOverlapPeriod=Years
CRLOverlapUnits=1
CRLDeltaPeriodUnits=0
CRLDeltaPeriod=days
 
DiscreteSignatureAlgorithm=1
```
2. copy the root CA certificate in the policy CA server certificates store. This needs to be imported in the **Trusted Root Certification Authorities** folder. Verify the same via mmc>certificates.
3.  Install AD CS role.
```powershell
Install-WindowsFeature ADCS-Cert-Authority -IncludeManagementTools
```

4. Configure ADCS .
```powershell
Install-AdcsCertificationAuthority -CAType "StandaloneSubordinateCA" -CACommonName "Finland TCSECP PolicyCA" -CADistinguishedNameSuffix "DC=fi,DC=tcsecp,DC=com" -KeyLength 2048 -HashAlgorithmName SHA256 -CryptoProviderName "RSA#Microsoft Software Key Storage Provider"  -DatabaseDirectory "D:\CA\CertDB"  -LogDirectory "D:\CA\CertLogs"  -ValidityPeriod Years
```

5. Copy the .req file created in step a to the root ca.
6. open the **Certification Authority** console, right-click the CA name and choose **All Tasks > Submit New Request**. Select the .req file.
7. Inside the **Pending Request** folder we should have a certificate request in a pending state. Right-click it and choose **All Tasks > Issue**.
8. Now click the **Issued Certificates** folder and open the certificate we just issued. Go to the **Details** tab and click the **Copy to File** button. Export the certificate by following the wizard.
9. Back on the policy CA server, open the **Certification Authority** console, right -click the CA name and choose **All Tasks > Install CA Certificate**.
10. Search for the certificate we just exported from the root CA, select it and click **Open**. The certificate installation will take a few seconds to complete and once it’s done click the green arrow button from the **Tools** menu to start the Certificate Services service; which should start successfully.
11. Configure publication points and certificates validity period for the Root CA.
	1. Open the **Certification Authority** console, right-click the CA name and choose **Properties**. 
	2. Once the **Properties** window opens, go to the **Extensions** tab and remove all the locations from the list except the first one, by selecting them one by one and clicking the **Remove** button.
	3. Then add the url (http://pki.fi.tcsecp.com/crl/InterCA.crl) for the web server as publication point. Never use the HTTPS protocol for CRT/CRL file retrieval because is not going to work. CryptoAPI will permanently fail to fetch HTTPS URLs. check the box **Include in the CDP extension of issued certificates**.
	4. Move to the AIA extension by clicking the **Select extension** drop-down box. As before, remove all the locations in the list except the first one, then hit the **Add** button to add the new location (http://pki.fi.tcsecp.com/crl/InterCA.crt) for the root CA certificate. Once added, don’t forget to check the box **Include in the AIA extension of issued certificates**. Click **OK** then **Yes** to restart the **Certificate Services** service.
12. Set cert duration to 5 years.
```cmd
certutil -setreg ca\ValidityPeriodUnits 5
certutil -setreg ca\ValidityPeriod "Years"
net stop certsvc
net start certsvc
```
13. Copy certs from **%Windir%\System32\Certsrv\Certenroll** to the Webserver path mentioned in the step above. Rename as needed to InterCA.crl and InterCA.crt.


# Issuer CA
1. Add gpo to enable root and inter ca certs for all machines.
2. Go to issuer vms and run gpupdate /force. Verify in mmc>certs.
3. Create CAPolicy.inf under C:\Windows
```text
[Version]
Signature=$Windows NT$"
 
[certsrv_server]
Renewalkeylength=2048
RenewalvalidityPeriodUnits=5
RenewalvalidityPeriod=years
 
CRLPeriod=Days
CRLPeriodUnits=7
CRLDeltaPeriod=Hours
CRLDeltaPeriodUnits=24
CRLOverlapUnits=2
CRLOverlapPeriod=Days
CRLDeltaOverlapUnits=Hours
DeltaOverlapPeriod=6
 
DiscreteSignatureAlgorithm=1
LoadDefaultTemplates=0
```
4. Install AD CS role.
```powershell
Install-WindowsFeature ADCS-Cert-Authority -IncludeManagementTools
```

5. User should be enterprise admin. Configure ADCS .
```powershell
Install-AdcsCertificationAuthority -CAType "StandaloneSubordinateCA" -CACommonName "Finland TCSECP PolicyCA" -CADistinguishedNameSuffix "DC=fi,DC=tcsecp,DC=com" -KeyLength 2048 -HashAlgorithmName SHA256 -CryptoProviderName "RSA#Microsoft Software Key Storage Provider"  -DatabaseDirectory "D:\CA\CertDB"  -LogDirectory "D:\CA\CertLogs"  -ValidityPeriod Years
```
6. Copy the .req file to intermediary ca.
7. open the **Certification Authority** console, right-click the CA name and choose **All Tasks > Submit New Request**. Select the .req file.
8. Inside the **Pending Request** folder we should have a certificate request in a pending state. Right-click it and choose **All Tasks > Issue**.
9. Now click the **Issued Certificates** folder and open the certificate we just issued. Go to the **Details** tab and click the **Copy to File** button. Export the certificate by following the wizard.
10. Copy the file to the issuer node. open the **Certification Authority** console, right -click the CA name and choose **All Tasks > Install CA Certificate**. Start after install is completed.
11. Backup the CA
	1. 1.  On the **Action** menu, click **All Tasks**, and then click **Backup CA**.
	2.   On the Welcome page of the CA backup wizard, click **Next**.
	3.   Select **Private key and CA certificate** and provide a directory name where you want to temporarily store the CA certificate and optionally the key. Click **Next**.
	4.   Provide a password to protect the CA key and click **Next**.
	5.  Click **Finish.**
12. Shutdown the CA to release disk.
	1. While the CA is selected in the left pane, on the **Action** menu, click **All Tasks**, and then click **Stop Service**.
13. Copy the backup created to the second node.
14. Open mmc --> certificates. expand the **Certificates (Local Computer)** node and select the **Personal** store.
15. Create CAPolicy.inf under C:\Windows
```text
[Version]
Signature=$Windows NT$"
 
[certsrv_server]
Renewalkeylength=2048
RenewalvalidityPeriodUnits=5
RenewalvalidityPeriod=years
 
CRLPeriod=Days
CRLPeriodUnits=7
CRLDeltaPeriod=Hours
CRLDeltaPeriodUnits=24
CRLOverlapUnits=2
CRLOverlapPeriod=Days
CRLDeltaOverlapUnits=Hours
DeltaOverlapPeriod=6
 
DiscreteSignatureAlgorithm=1
LoadDefaultTemplates=0
```
4. Install AD CS role.
```powershell
Install-WindowsFeature ADCS-Cert-Authority -IncludeManagementTools
```

5. User should be enterprise admin. Configure ADCS .
	1. Select **Use existing private key**, choose **Select a certificate and use its associated private key**, then click **Next**.
	2. Select the CA certificate that was generated on the first node and click **Next**.
	3. Change the default paths for the database. In the dialog box stating that an existing database was found, select **Yes** to overwrite it.
	4. Logoff from the node.
6. Setting up the failover cluster.
	1. Create cluster
	2. Configure cluster as generic service, and click **Next**.
	3. In the list of services and applications, select **Generic Service** and click **Next**.
	4.  In the list of services, select **Active Directory Certificate Services** and click **Next**.
	6.  Mark the disk storage that is still mounted to the node and click **Next**.
	7.  To configure a shared registry hive, click **Add**, type **SYSTEM\CurrentControlSet\Services\CertSvc** and then click **OK**.
	8.  Click **Next** twice.
	9.   Click **Finish** to complete the failover configuration for certificate services.



# Configuring publication points and certificates validity period for the Root CA
http://pki.fi.tcsecp.com/RootCA.crl

## Root server
http://pki.fi.tcsecp.com/crl/RootCA.crl
http://pki.fi.tcsecp.com/crl/RootCA.crt

## Install clustered issuing CAs
1. User should be enterprise admin
2. root and inter certs applied as gpo
3. gpupdate /force
4. install ca role and configure.
	1. Install-WindowsFeature ADCS-Cert-Authority
5. Configuration:
	1. FITCSECP-IssuerCA

DN to use
CN = FITCSECP-RootCA
CN = FITCSECP-InterCA
CN=FITCSECP-IssuerCA
    DC=fi
    DC=tcsecp
    DC=com

---
references:
1. [TechNet Wiki (microsoft.com)](https://social.technet.microsoft.com/wiki/contents/articles/9256.active-directory-certificate-services-ad-cs-clustering.aspx#Understanding_Names_Used_in_a_Cluster_Configuration)
2. [Building a three-tier Windows Certification Authority Hierarchy (vkernel.ro)](https://www.vkernel.ro/blog/building-a-three-tire-windows-certification-authority-hierarchy)
