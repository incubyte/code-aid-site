---
title: "HumanResources.vJobCandidateEmployment"
linkTitle: "HumanResources.vJobCandidateEmployment"
description: "HumanResources.vJobCandidateEmployment"
---

# Views

## [HumanResources].[vJobCandidateEmployment]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 28
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|



{{< details "Sql Code" >}}
```sql

CREATE VIEW [HumanResources].[vJobCandidateEmployment] 
AS 
SELECT 
    jc.[JobCandidateID] 
    ,CONVERT(datetime, REPLACE([Employment].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Emp.StartDate)[1]', 'nvarchar(20)') ,'Z', ''), 101) AS [Emp.StartDate] 
    ,CONVERT(datetime, REPLACE([Employment].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Emp.EndDate)[1]', 'nvarchar(20)') ,'Z', ''), 101) AS [Emp.EndDate] 
    ,[Employment].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Emp.OrgName)[1]', 'nvarchar(100)') AS [Emp.OrgName]
    ,[Employment].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Emp.JobTitle)[1]', 'nvarchar(100)') AS [Emp.JobTitle]
    ,[Employment].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Emp.Responsibility)[1]', 'nvarchar(max)') AS [Emp.Responsibility]
    ,[Employment].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Emp.FunctionCategory)[1]', 'nvarchar(max)') AS [Emp.FunctionCategory]
    ,[Employment].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Emp.IndustryCategory)[1]', 'nvarchar(max)') AS [Emp.IndustryCategory]
    ,[Employment].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Emp.Location/Location/Loc.CountryRegion)[1]', 'nvarchar(max)') AS [Emp.Loc.CountryRegion]
    ,[Employment].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Emp.Location/Location/Loc.State)[1]', 'nvarchar(max)') AS [Emp.Loc.State]
    ,[Employment].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Emp.Location/Location/Loc.City)[1]', 'nvarchar(max)') AS [Emp.Loc.City]
FROM [HumanResources].[JobCandidate] jc 
CROSS APPLY jc.[Resume].nodes(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
    /Resume/Employment') AS Employment(ref);

```
{{< /details >}}
## Overview
This script creates a view named `[HumanResources].[vJobCandidateEmployment]` that provides a more user-friendly format of JobCandidate data by extracting the necessary information from JobCandidate XML data.

## Details

### Information on Data
The view fetches data from the `[HumanResources].[JobCandidate]` table.

### Information on the Tables
The table `[HumanResources].[JobCandidate]` contains the following columns:
- JobCandidateID
- Resume

The script converts the XML data contained in the `Resume` column into readable data using the `nodes` and `value` functionalities.

### Possible Optimization Opportunities
1. Consider using a SQL-based format instead of XML for the `[Resume]` column, which could make it easier to query and manage data.
2. Use meaningful column aliases for the output columns of the view for better clarity and readability.

### Possible Bugs
1. If the XML structure changes, the view will not work as expected, or data may be missing or incorrect.

### Risk
- If any XML data is not properly formatted or missing required elements, this could result in NULL values or errors.

### Code Complexity
- The code uses XML namespaces and multiple XPath queries, which could be challenging for developers unfamiliar with XML handling in SQL.

### Refactoring Opportunities
1. Replacing XML with structured SQL tables could simplify the code complexity by eliminating the need for XML queries.
2. Consider breaking down the view into smaller, more focused views if this view becomes too complicated or lengthy.

## User Acceptance Criteria

### Gherkin Scripts
----------
*Scenario 1: Retrieving JobCandidate Employment Details*
```gherkin
Given the [HumanResources].[vJobCandidateEmployment] view is created
When I run a SELECT query on the view
Then I should get employment details for all JobCandidates including StartDate, EndDate, OrgName, JobTitle, Responsibility, FunctionCategory, IndustryCategory, CountryRegion, State, and City
```

----------
*Scenario 2: Adding New JobCandidate Record*
```gherkin
Given the [HumanResources].[vJobCandidateEmployment] view is created
When I insert a new record to the [HumanResources].[JobCandidate] table with valid XML Resume data
Then the new record should be included in the [HumanResources].[vJobCandidateEmployment] view output
```

----------
*Scenario 3: Modifying Existing JobCandidate Record*
```gherkin
Given the [HumanResources].[vJobCandidateEmployment] view is created
When I update any existing [HumanResources].[JobCandidate] record
Then the changes should be reflected in the [HumanResources].[vJobCandidateEmployment] view output
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | [HUMANRESOURCES].[JOBCANDIDATE].[JobCandidateID] | NA | NA |  |  |  |  |  | [HumanResources].[JobCandidate] |

