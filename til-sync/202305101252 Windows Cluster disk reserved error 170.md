---
tag: #windows, #cluster
aliases:
---

Error:
```
Node is not able to join after reboot, goes in quarantine

In cluster logs:
[Verbose] 00000f44.00000a58::2023/05/08-11:55:37.173 WARN  [CORE] Node 7ogbwtsqldb08 attempted to bring online the witness resource at time 2023/05/08-08:49:35.935 with result (5038) Failed to bring quorum resource 97b68097-a457-4539-b315-c3cd433a5e01 online, status 5038
[Verbose] 00000f44.00000a58::2023/05/08-11:55:37.173 WARN  [QUORUM] An attempt to form cluster failed due to insufficient quorum votes. Try starting additional cluster node(s) with current vote or as a last resort use Force Quorum option to start the cluster. Look below for quorum information,
[Verbose] 00000f44.00000a58::2023/05/08-11:55:37.173 WARN  [QUORUM] To achieve quorum cluster needs at least 2 of quorum votes. There is only 2 quorum votes running
[Verbose] 00000f44.00000a58::2023/05/08-11:55:37.173 WARN  [QUORUM] List of running node(s) attempting to form cluster: 7ogbwtsqldb08, 5ogbwtsqldb09,
[Verbose] 00000f44.00000a58::2023/05/08-11:55:37.173 WARN  [QUORUM] List of running node(s) with current vote: 7ogbwtsqldb08, 5ogbwtsqldb09,
[Verbose] 00000f44.00000a58::2023/05/08-11:55:37.173 WARN  [QUORUM] Attempt to start some or all of the following down node(s) that have current vote: Quorum Disk,
[Verbose] 00000f44.00000a58::2023/05/08-11:55:37.173 WARN  FatalError: join/form timeout (status = 258)
```

Further: 
```text

[Verbose] 00002344.000016a4::2023/05/08-11:56:49.325 WARN  [RES] Physical Disk <Quorum Disk>: HardDiskpPRArbitrate: Failed to preempt reservation, new key bce033420001734d, old key 4dda28d90002734d, status 170
[Verbose] 00002344.000016a4::2023/05/08-11:56:49.602 ERR   [RES] Physical Disk <Quorum Disk>: ResHardDiskArbitrateInternal: PR Arbitration for disk Error: 170
```

5038 is

5038 (0x13AE)

A cluster resource failed.

170 is

ERROR_BUSY

170 (0xAA)

The requested resource is in use.

Resolution:
Shared RDMs must be perennially reserved. Issue fixed after that.


---
# references: