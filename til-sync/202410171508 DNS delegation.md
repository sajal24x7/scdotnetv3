---
tags:
  - "#dns"
  - "#windows"
aliases:
  - DNS delegation
  - Delegated zone
  - Create zone delegation
---
We can create a delegated zone and allow app/teams to create entries as needed
This was for example, what is requested for storage appliance

# GUI
Here's how to create a zone delegation using DNS Manager.

1. From the Windows desktop, open the **Start** menu, select **Windows Administrative Tools > DNS**.
    
2. In the console tree, expand a DNS server, right-click the DNS zone to delegate, then select **New Delegation**.
    
3. On the Delegated Domain Name page, enter the delegated domain name. For example, to delegate the subdomain `south.west.contoso.com`, enter `south`. The fully qualified domain name (FQDN) name is automatically be appended.
    
4. Select **Add** to specify the names and IP addresses of the DNS server to host the delegated zone.
    
    1. Enter either:
        
        - The FQDN of the DNS server that is authoritative for the delegated zone, then select **Resolve**. Add other DNS servers if necessary, when validated select **OK**.
            
            Or
            
        - Manually enter the IP address of the DNS server that is authoritative for the delegated zone. Add other DNS servers if necessary, when validated select **OK**.
            
5. Select **Finish** to complete the New Delegation Wizard.

---
# references:

[Manage DNS zones using DNS server in Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/networking/dns/manage-dns-zones?tabs=gui)