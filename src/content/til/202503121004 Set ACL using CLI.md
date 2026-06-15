---
title: Set ACL Using CLI
slug: set-acl-using-cli
created: 2025-03-12T07:40:41.000Z
updated: 2025-03-12T07:40:41.000Z
category: til
tags:
  - '#powershell'
  - windows
  - acl
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modod34cy72o'
  - 'https://mastodon.social/@sajal24x7/116756405323635329'
---
There are two options:
1. icacls
2. PowerShell


```powershell
# Path
$Path = ""

# Permissions that need to be set
$identity = "GT-DLPscan-R"
$fileSystemRights = "Read"
$type = "Allow"
$inheritance = "ContainerInherit,ObjectInherit"
$propagation = "None"

# Create rule

$rule = New-Object System.Security.AccessControl.FileSystemAccessRule($identity, $fileSystemRights, $inheritance, $propagation, $type)

## Get ACL
try {
	$Acl = Get-Acl -Path $Folder -ErrorAction Stop
	# Add the new rule to folder rules
	$Acl.SetAccessRule($rule)
	# Set ACL
	$Acl | Set-Acl -Path $Folder -ErrorAction Stop
} catch {
	$Error = "Unable to set acl. Error : $_"
	Write-Host $Error
}

```

## Typical file system rights
|Name|Value|Description|
|---|---|---|
|ListDirectory|1|Specifies the right to read the contents of a directory.|
|ReadData|1|Specifies the right to open and copy a file or folder. This does not include the right to read file system attributes, extended file system attributes, or access and audit rules.|
|CreateFiles|2|Specifies the right to create a file. This right requires the `Synchronize` value.|
|WriteData|2|Specifies the right to open and write to a file or folder. This does not include the right to open and write file system attributes, extended file system attributes, or access and audit rules.|
|AppendData|4|Specifies the right to append data to the end of a file.|
|CreateDirectories|4|Specifies the right to create a folder This right requires the `Synchronize` value.|
|ReadExtendedAttributes|8|Specifies the right to open and copy extended file system attributes from a folder or file. For example, this value specifies the right to view author and content information. This does not include the right to read data, file system attributes, or access and audit rules.|
|WriteExtendedAttributes|16|Specifies the right to open and write extended file system attributes to a folder or file. This does not include the ability to write data, attributes, or access and audit rules.|
|ExecuteFile|32|Specifies the right to run an application file.|
|Traverse|32|Specifies the right to list the contents of a folder and to run applications contained within that folder.|
|DeleteSubdirectoriesAndFiles|64|Specifies the right to delete a folder and any files contained within that folder.|
|ReadAttributes|128|Specifies the right to open and copy file system attributes from a folder or file. For example, this value specifies the right to view the file creation or modified date. This does not include the right to read data, extended file system attributes, or access and audit rules.|
|WriteAttributes|256|Specifies the right to open and write file system attributes to a folder or file. This does not include the ability to write data, extended attributes, or access and audit rules.|
|Write|278|Specifies the right to create folders and files, and to add or remove data from files. This right includes the [WriteData](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-writedata) right, [AppendData](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-appenddata) right, [WriteExtendedAttributes](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-writeextendedattributes) right, and [WriteAttributes](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-writeattributes) right.|
|Delete|65536|Specifies the right to delete a folder or file.|
|ReadPermissions|131072|Specifies the right to open and copy access and audit rules from a folder or file. This does not include the right to read data, file system attributes, and extended file system attributes.|
|Read|131209|Specifies the right to open and copy folders or files as read-only. This right includes the [ReadData](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-readdata) right, [ReadExtendedAttributes](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-readextendedattributes) right, [ReadAttributes](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-readattributes) right, and [ReadPermissions](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-readpermissions) right.|
|ReadAndExecute|131241|Specifies the right to open and copy folders or files as read-only, and to run application files. This right includes the [Read](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-read) right and the [ExecuteFile](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-executefile) right.|
|Modify|197055|Specifies the right to read, write, list folder contents, delete folders and files, and run application files. This right includes the [ReadAndExecute](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-readandexecute) right, the [Write](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-write) right, and the [Delete](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0#system-security-accesscontrol-filesystemrights-delete) right.|
|ChangePermissions|262144|Specifies the right to change the security and audit rules associated with a file or folder.|
|TakeOwnership|524288|Specifies the right to change the owner of a folder or file. Note that owners of a resource have full access to that resource.|
|Synchronize|1048576|Specifies whether the application can wait for a file handle to synchronize with the completion of an I/O operation. This value is automatically set when allowing access and automatically excluded when denying access.|
|FullControl|2032127|Specifies the right to exert full control over a folder or file, and to modify access control and audit rules. This value represents the right to do anything with a file and is the combination of all rights in this enumeration.|


## Useful combined chart

| Desired Outcome                       | Inheritance                    | Propagate          |
| ------------------------------------- | ------------------------------ | ------------------ |
| **Subfolders and Files only**         | ContainerInherit,ObjectInherit | InheritOnly        |
| **This Folder, Subfolders and Files** | ContainerInherit,ObjectInherit | None               |
| **This Folder, Subfolders and Files** | ContainerInherit,ObjectInherit | NoPropagateInherit |
| **This folder and subfolders**        | ContainerInherit               | None               |
| **Subfolders only**                   | ContainerInherit               | InheritOnly        |
| **This folder and files**             | ObjectInherit                  | None               |
| **This folder and files**             | ObjectInherit                  | NoPropagateInherit |

## Inheritance values

To provide combined value, need to add numbers, so Container+Object is 3.

| Name             | Value | Description                                      |
| ---------------- | ----- | ------------------------------------------------ |
| None             | 0     | The ACE is not inherited by child objects.       |
| ContainerInherit | 1     | The ACE is inherited by child container objects. |
| ObjectInherit    | 2     | The ACE is inherited by child leaf objects.      |

## Propagation inherit values

| Name               | Value | Description                                                                                                      |
| ------------------ | ----- | ---------------------------------------------------------------------------------------------------------------- |
| None               | 0     | Specifies that no inheritance flags are set.                                                                     |
| NoPropagateInherit | 1     | Specifies that the ACE is not propagated to child objects.                                                       |
| InheritOnly        | 2     | Specifies that the ACE is propagated only to child objects. This includes both container and leaf child objects. |


---
# references:
[PropagationFlags Enum (System.Security.AccessControl) | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.propagationflags?view=windowsdesktop-5.0)
[InheritanceFlags Enum (System.Security.AccessControl) | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.inheritanceflags?view=windowsdesktop-5.0)
[FileSystemRights Enum (System.Security.AccessControl) | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/system.security.accesscontrol.filesystemrights?view=windowsdesktop-5.0)
[Directory Security and Access Rules - Damir Dobric Posts - developers.de](https://developers.de/blogs/damir_dobric/archive/2007/06/18/directory-security-and-access-rules.aspx)
