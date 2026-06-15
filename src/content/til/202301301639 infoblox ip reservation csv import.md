---
title: Infoblox Ip Reservation Csv Import
slug: infoblox-ip-reservation-csv-import
created: '2023-01-30T16:39:00+03:00'
updated: '2023-01-30T16:39:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754738313959145'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modknyzyi52v'
---


These fields required:

``` text
header-fixedaddress,ip_address*,mac_address*,name,comment  
FixedAddress,10.45.48.1,00:00:00:00:00:00,,Gateway
```

If no existing data, then if you chose modify as the import mode, it fails. As existing record is not there.

So, if data does not exist, it needs to be Add when doing import.

---
# references:
[IPv4 Fixed Address/Reservation - NIOS CSV Import Reference - Infoblox Documentation Portal](https://docs.infoblox.com/space/NCR8/23069057/IPv4+Fixed+Address%2FReservation)
