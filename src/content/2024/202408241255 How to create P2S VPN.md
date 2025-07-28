---
title: How to create P2S VPN
slug: how-to-create-p2s-vpn
pubDate: '2024-08-24T12:55:00+03:00'
updatedDate: '2024-08-24T12:55:00+03:00'
category: til
tags:
- azure
- network
---

How it differs from [[202408241251 How to create S2S VPN|S2S VPN]] is around authentication.
There are three types basically:
1. [Certificate authentication](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal)
2. [Microsoft Entra ID authentication](https://learn.microsoft.com/en-us/azure/vpn-gateway/point-to-site-entra-gateway)
3. [RADIUS authentication](https://learn.microsoft.com/en-us/azure/vpn-gateway/point-to-site-how-to-radius-ps)

# Certificate Authentication
1. [Create a VNet](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#createvnet)
2. [Create a gateway subnet](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#create-a-gateway-subnet)
3. [Create the VPN gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#creategw)
4. [Generate certificates](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#generatecert)
5. [Add the address pool](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#addresspool)
6. [Specify tunnel and authentication type](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#type)
7. [Additional IP address](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#publicip3)
8. [Upload root certificate public key information](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#uploadfile)
9. [Generate VPN client profile configuration files](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#profile-files)
10. [Configure VPN clients and connect to Azure](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#clientconfig)
11. [Verify your connection](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#verify)
12. [Connect to a virtual machine](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#connectVM)

---
# references:
[MS Docs](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal)