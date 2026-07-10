---
tags:
  - linux
aliases:
  - tar
category: til
---
## General order
Create archive (.tar) --> Compress the archive (.tar.gz) --> Backup/whatever

## Fun things -
1. tar (tape archive)
2. A good idea to list the files in the archive first to see where it will go after extracting

## Commands

### Archive
``` bash
# To list archive contents
tar --list --file <archivename>
tar -tf <archivename>
tar tf <archivename>


## To create 
tar --create --file <archivename> <filetobearchived>
tar cf <archivename> <filetobearchived>

## To append to existing archive
tar --append --file <archivename> <filetobearchived>
tar rf <archivename> <filetobearchived>

## To extract 
tar --extract --file <archivename>
tar xf <archivename>

## To extract in different directory
tar --extract --file <archivename> --directory <dirname>
tar xf <archivename> -C <dirname>
```

### Compression

```bash

sudo tar czfP <archivename> <dirname>
```

