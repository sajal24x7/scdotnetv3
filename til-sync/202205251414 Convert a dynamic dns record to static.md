---
aliases:
  - Convert a dynamic dns record to static
tags:
  - "#dns"
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
---
1. dnsmgmt.msc
2. Enable advanced view.
3. Find the record. Right click > Properties. Disable **Delete this record when it becomes stale** check box and then click on **OK**

---
references:
[How to Convert a Dynamic Resource Record to a Static One Without Re-Creating it in DNS - TechNet Articles - United States (English) - TechNet Wiki (microsoft.com)](https://social.technet.microsoft.com/wiki/contents/articles/21726.how-to-convert-a-dynamic-resource-record-to-a-static-one-without-re-creating-it-in-dns.aspx#:~:text=To%20convert%20a%20dynamic%20resource%20record%20to%20a,stale%20check%20box%20and%20then%20click%20on%20OK)