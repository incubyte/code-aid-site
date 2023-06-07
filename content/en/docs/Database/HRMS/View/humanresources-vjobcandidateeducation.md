---
title: "HumanResources.vJobCandidateEducation"
linkTitle: "HumanResources.vJobCandidateEducation"
description: "HumanResources.vJobCandidateEducation"
---

# Views

## [HumanResources].[vJobCandidateEducation]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 32
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|



{{< details "Sql Code" >}}
```sql

CREATE VIEW [HumanResources].[vJobCandidateEducation] 
AS 
SELECT 
    jc.[JobCandidateID] 
    ,[Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.Level)[1]', 'nvarchar(max)') AS [Edu.Level]
    ,CONVERT(datetime, REPLACE([Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.StartDate)[1]', 'nvarchar(20)') ,'Z', ''), 101) AS [Edu.StartDate] 
    ,CONVERT(datetime, REPLACE([Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.EndDate)[1]', 'nvarchar(20)') ,'Z', ''), 101) AS [Edu.EndDate] 
    ,[Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.Degree)[1]', 'nvarchar(50)') AS [Edu.Degree]
    ,[Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.Major)[1]', 'nvarchar(50)') AS [Edu.Major]
    ,[Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.Minor)[1]', 'nvarchar(50)') AS [Edu.Minor]
    ,[Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.GPA)[1]', 'nvarchar(5)') AS [Edu.GPA]
    ,[Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.GPAScale)[1]', 'nvarchar(5)') AS [Edu.GPAScale]
    ,[Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.School)[1]', 'nvarchar(100)') AS [Edu.School]
    ,[Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.Location/Location/Loc.CountryRegion)[1]', 'nvarchar(100)') AS [Edu.Loc.CountryRegion]
    ,[Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.Location/Location/Loc.State)[1]', 'nvarchar(100)') AS [Edu.Loc.State]
    ,[Education].ref.value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
        (Edu.Location/Location/Loc.City)[1]', 'nvarchar(100)') AS [Edu.Loc.City]
FROM [HumanResources].[JobCandidate] jc 
CROSS APPLY jc.[Resume].nodes(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume"; 
    /Resume/Education') AS [Education](ref);

```
{{< /details >}}
## Overview
The given SQL script creates a view called `[HumanResources].[vJobCandidateEducation]`, which is designed to extract education information about job candidates from the `[HumanResources].[JobCandidate]` table. The view uses a `CROSS APPLY` operation to extract XML data from the `Resume` column in the job candidate table and present it in a more human-readable table format.

## Details
1. Database Objects:
    - View: `[HumanResources].[vJobCandidateEducation]`

2. Source Table:
    - `[HumanResources].[JobCandidate]`

3. Columns:
   - JobCandidateID
   - Edu.Level
   - Edu.StartDate
   - Edu.EndDate
   - Edu.Degree
   - Edu.Major
   - Edu.Minor
   - Edu.GPA
   - Edu.GPAScale
   - Edu.School
   - Edu.Loc.CountryRegion
   - Edu.Loc.State
   - Edu.Loc.City

## Information on Data
The view gets its data from the XML column `Resume` of the `[HumanResources].[JobCandidate]` table. Using the XML functions available in SQL Server, it extracts various education-related data points into individual columns in the view.

## Information on the Tables
1. The `[HumanResources].[JobCandidate]` table stores information about job candidates, including their resumes in an XML format.

## Possible Optimization Opportunities
There are no obvious optimization opportunities in the given script, as it seems to be extracting necessary data from the XML columns as efficiently as possible.

## Possible Bugs
There are no evident bugs in the given script.

## Risks
1. The script uses hardcoded XML namespaces. If the XML schema or namespace changes, the view will need to be updated accordingly.
2. There are no `WHERE` clauses in this SQL script, which means the view will be populated with data related to all job candidates in the `[HumanResources].[JobCandidate]` table. This might not be a risk since views are meant to display the overall picture of a certain subject.

## Code Complexity
The complexity of the script is primarily due to the different XML functions and XPath expressions required to extract the necessary information from the `Resume` XML column. However, the script should be reasonably easy to understand for someone familiar with SQL Server's XML functions and XPath.

## Refactoring Opportunities
There are no evident refactoring opportunities, as the script is straightforward and well-formatted.

## User Acceptance Criteria
```
Feature: vJobCandidateEducation_View

  Scenario: Retrieve job candidate's education information
    Given I have the [HumanResources].[vJobCandidateEducation] view created
    When I query the view for a specific JobCandidateID
    Then I should get a row of education information for the job candidate, including StartDate, EndDate, Degree, Major, Minor, GPA, GPAScale, School, CountryRegion, State, and City
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstselect | [HUMANRESOURCES].[JOBCANDIDATE].[JobCandidateID] | NA | NA |  |  |  |  |  | [HumanResources].[JobCandidate] |

