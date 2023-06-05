---
title: "HumanResources.vJobCandidate"
linkTitle: "HumanResources.vJobCandidate"
description: "HumanResources.vJobCandidate"
---

# Views

## [HumanResources].[vJobCandidate]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 36
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|



{{< details "Sql Code" >}}
```sql

CREATE VIEW [HumanResources].[vJobCandidate] 
AS 
SELECT 
    jc.[JobCandidateID] 
    ,jc.[BusinessEntityID] 
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (/Resume/Name/Name.Prefix)[1]', 'nvarchar(30)') AS [Name.Prefix] 
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume";
        (/Resume/Name/Name.First)[1]', 'nvarchar(30)') AS [Name.First] 
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (/Resume/Name/Name.Middle)[1]', 'nvarchar(30)') AS [Name.Middle] 
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (/Resume/Name/Name.Last)[1]', 'nvarchar(30)') AS [Name.Last] 
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (/Resume/Name/Name.Suffix)[1]', 'nvarchar(30)') AS [Name.Suffix] 
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (/Resume/Skills)[1]', 'nvarchar(max)') AS [Skills] 
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Address/Addr.Type)[1]', 'nvarchar(30)') AS [Addr.Type]
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Address/Addr.Location/Location/Loc.CountryRegion)[1]', 'nvarchar(100)') AS [Addr.Loc.CountryRegion]
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Address/Addr.Location/Location/Loc.State)[1]', 'nvarchar(100)') AS [Addr.Loc.State]
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Address/Addr.Location/Location/Loc.City)[1]', 'nvarchar(100)') AS [Addr.Loc.City]
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Address/Addr.PostalCode)[1]', 'nvarchar(20)') AS [Addr.PostalCode]
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (/Resume/EMail)[1]', 'nvarchar(max)') AS [EMail] 
    ,[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (/Resume/WebSite)[1]', 'nvarchar(max)') AS [WebSite] 
    ,jc.[ModifiedDate] 
FROM [HumanResources].[JobCandidate] jc 
CROSS APPLY jc.[Resume].nodes(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
    /Resume') AS Resume(ref);

```
{{< /details >}}
## Overview

The provided SQL script creates a view called `[HumanResources].[vJobCandidate]` that records job candidate resume details.

## Details

### Information on Data 

The view retrieves data from the `[HumanResources].[JobCandidate]` table. The data involves job candidates' personal information, resumes, and addresses.

### Information on the Tables 

1. `[HumanResources].[JobCandidate]`: This table contains information of the job candidates including `JobCandidateID`, `BusinessEntityID`, and `Resume` (of XML type).

### Possible Optimization Opportunities 

1. If the table becomes too large, consider adding necessary indexes to enhance querying efficiency.

### Possible Bugs 

No apparent bugs are found in the SQL script.

### Risk 

No risks are detected, and no query is executed without the `WHERE` clause.

### Code Complexity 

The code complexity lies in the XML processing, as it extracts various data points from the resume.

```SQL
[Resume].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
    (/Resume/Name/Name.Prefix)[1]', 'nvarchar(30)') AS [Name.Prefix]
```

### Refactoring Opportunities 

No immediate refactoring opportunities are found within the SQL script.

## User Acceptance Criteria 

User acceptance criteria are defined in Gherkin syntax to test the behavior of the code.

```Gherkin
Feature: Job Candidate Resume View
  The view should display the extracted personal details and addresses of the candidates.

  Scenario: View the job candidate resume data
    Given the HumanResources.JobCandidate table contains the job candidate resumes
    When the view HumanResources.vJobCandidate is queried
    Then the output should be the extracted details from the resumes, including name, skills, and addresses
```

Remember to follow the best practices while working with database objects, and please make sure to perform testing before applying any changes to the production environment.
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstselect | [HUMANRESOURCES].[JOBCANDIDATE].[JobCandidateID], [HUMANRESOURCES].[JOBCANDIDATE].[BusinessEntityID], [HUMANRESOURCES].[JOBCANDIDATE].[ModifiedDate] | NA | NA |  |  |  |  |  | [HumanResources].[JobCandidate] |

