---
aliases:
  - PowerShell Training Overview
tags:
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
1. Introduction
	1. PowerShell - Shell + Scripting and how to run it
	2. extensible
	3. Check version
	4. Running with VS code
2.  Help System
	1. -online tag
	2. about topics
3. Running commands - Day1
	1. execution policy
	3. Cmdlets / form / convention
	4. using parameter names 
		1. positional
		2. required
	5. shortcuts
4. Providers (How to use files and folders) 
	1. PSProviders - maps things to powershell for use
	2. Using wildcards
	3. Registry things
5. Pipeline
	1. Connecting
	2. Export
	3. Killing processes
	4. How powershell passes data down the pipeline | pipeline parameter binding --> Day2
		1. First ByValue
		2. Then ByPropertyName 
	5. Select with Name and Expression
6. Extensions
	1. Modules
7. Objects
	1. What and why?
	2. Get-member
	3. How to use
8. Formatting - Day 3
	1. ft (with Name and expression)
	2. fl
	3. out
	4. out-gridview
9. Filtering and comparison
	1. Filter left (as close to the first cmdlet as possible)
	2. Comparison Operators
	3. Where-Object
10. Remote control - Day 4
	1. WinRMGet
	2. -ComputerName
	3. Enter-PSSession/ Exit-PSSession
	4. Invoke-Command/Invoke-Scriptblock
	5. Diff between remote and local commands
		1.  lack methods (readonly copy)
	6. New-PSsession / Remove-PSSession
11. Variables - Day 5
	1. Types
	2. Quotes
	3. Arrays
		1. how to access object
		2. how to access one property for multiple objects
	4. $() - subexpression
	5. specify type using []
	6. Best practices
		1. No space
		2. Name properly with description
		3. define type
12. Input/Output
	1. Read-Host
	2. Write-Host
	3. Write-Output
	4. Otherways
	5. -verbose
13. Scripting - Day 6
	1. Parameterization (help about_functions_advanced_parameters)
		1. [CmdletBinding()]
		2. Mandatory
		3. aliases
		4. validate
		5. Setting default parameter values
	2. Comments and stuff
	3. Scopes
	4. Functions
		1. begin
		2. process
		3. end
14. Logic and loops - Day 7
	1. foreach 
	2. foreach-object - pipeline
		1. alias %
		2. -parallel
	3. While
	4. do while
15. Error handling - Day 8
	1. Error variables
	2. Error action
	3. Error action preference (when -erroraction is not available)
	4. try catch finally blocks
16. Debugging
17. Random
	1. different versions of powershell
	2. Operators : -in, -contains, -join and -split, -replace, -as and -is
	3. Handling text
	4. Handling date
		1. WMI dates - ConvertDateTime and ConvertToDateTime
	5. Script blocks
		1. & operator - to run commands
	6. WMI and cim
	7. $null/empty strings/zero
		1. how to compare


---
# references: