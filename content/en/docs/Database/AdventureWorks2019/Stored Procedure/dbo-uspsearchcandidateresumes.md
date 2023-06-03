---
title: "dbo.uspSearchCandidateResumes"
linkTitle: "dbo.uspSearchCandidateResumes"
description: "dbo.uspSearchCandidateResumes"
---

# Stored Procedures

## [dbo].[uspSearchCandidateResumes]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 56
- **Code Complexity:** 5
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @searchString | NVARCHAR | IN |
| @useInflectional | BIT | IN |
| @useThesaurus | BIT | IN |
| @language | INT | IN |

{{< details "Sql Code" >}}
```sql

--A stored procedure which demonstrates integrated full text search

CREATE PROCEDURE [dbo].[uspSearchCandidateResumes]
    @searchString [nvarchar](1000),   
    @useInflectional [bit]=0,
    @useThesaurus [bit]=0,
    @language[int]=0


WITH EXECUTE AS CALLER
AS
BEGIN
    SET NOCOUNT ON;

      DECLARE @string nvarchar(1050)
      --setting the lcid to the default instance LCID if needed
      IF @language = NULL OR @language = 0 
      BEGIN 
            SELECT @language =CONVERT(int, serverproperty('lcid'))  
      END
      

            --FREETEXTTABLE case as inflectional and Thesaurus were required
      IF @useThesaurus = 1 AND @useInflectional = 1  
        BEGIN
                  SELECT FT_TBL.[JobCandidateID], KEY_TBL.[RANK] FROM [HumanResources].[JobCandidate] AS FT_TBL 
                        INNER JOIN FREETEXTTABLE([HumanResources].[JobCandidate],*, @searchString,LANGUAGE @language) AS KEY_TBL
                   ON  FT_TBL.[JobCandidateID] =KEY_TBL.[KEY]
            END

      ELSE IF @useThesaurus = 1
            BEGIN
                  SELECT @string ='FORMSOF(THESAURUS,"'+@searchString +'"'+')'      
                  SELECT FT_TBL.[JobCandidateID], KEY_TBL.[RANK] FROM [HumanResources].[JobCandidate] AS FT_TBL 
                        INNER JOIN CONTAINSTABLE([HumanResources].[JobCandidate],*, @string,LANGUAGE @language) AS KEY_TBL
                   ON  FT_TBL.[JobCandidateID] =KEY_TBL.[KEY]
        END

      ELSE IF @useInflectional = 1
            BEGIN
                  SELECT @string ='FORMSOF(INFLECTIONAL,"'+@searchString +'"'+')'
                  SELECT FT_TBL.[JobCandidateID], KEY_TBL.[RANK] FROM [HumanResources].[JobCandidate] AS FT_TBL 
                        INNER JOIN CONTAINSTABLE([HumanResources].[JobCandidate],*, @string,LANGUAGE @language) AS KEY_TBL
                   ON  FT_TBL.[JobCandidateID] =KEY_TBL.[KEY]
        END
  
      ELSE --base case, plain CONTAINSTABLE
            BEGIN
                  SELECT @string='"'+@searchString +'"'
                  SELECT FT_TBL.[JobCandidateID],KEY_TBL.[RANK] FROM [HumanResources].[JobCandidate] AS FT_TBL 
                        INNER JOIN CONTAINSTABLE([HumanResources].[JobCandidate],*,@string,LANGUAGE @language) AS KEY_TBL
                   ON  FT_TBL.[JobCandidateID] =KEY_TBL.[KEY]
            END

END;

```
{{< /details >}}
## Overview
This stored procedure allows the user to search candidate resumes using an integrated full-text search. The user can input a search string and toggle the use of inflectional or thesaurus searches using input parameters.

## Details
- Name: `[dbo].[uspSearchCandidateResumes]`
- Input Parameters:
  - `@searchString`: The search string (nvarchar 1000)
  - `@useInflectional`: To enable or disable the use of inflectional search (bit, default to 0)
  - `@useThesaurus`: To enable or disable the use of thesaurus search (bit, default to 0)
  - `@language`: The language code for the search (int, defaults to server language)

## Information on data
The stored procedure queries the `HumanResources.JobCandidate` table.

### Information on the tables
#### `HumanResources.JobCandidate`
- `JobCandidateID`: Unique identifier for a job candidate
- `Resume`: Resume text of the job candidate

## Possible optimization opportunities
1. Add indexes to the columns used in the search to speed up the query execution
2. Consider caching frequently used search results to decrease database load

## Possible bugs
None identified.

## Risk
The stored procedure runs without a WHERE clause. This may lead to potential performance issues due to the full scan of the table.

## Code Complexity
The code uses conditional logic based on user input for `useInflectional` and `useThesaurus` parameters. The logic is easy to understand but can be refactored to avoid repetitive code blocks.

## Refactoring Opportunities
1. Create a reusable function for search logic based on the given parameters to simplify the stored procedure (maintainability improvement)

## User Acceptance Criteria
```
Feature: Search candidate resumes using various search parameters

  Scenario: Search resumes without inflectional or thesaurus options
    Given the stored procedure [dbo].[uspSearchCandidateResumes] is called with searchString 'developer', useInflectional 0, and useThesaurus 0
    When the query executes
    Then the results should contain resumes with exact matches for 'developer'

  Scenario: Search resumes with inflectional option enabled
    Given the stored procedure [dbo].[uspSearchCandidateResumes] is called with searchString 'developer', useInflectional 1, and useThesaurus 0
    When the query executes
    Then the results should contain resumes with inflectional variations of 'developer'

  Scenario: Search resumes with thesaurus option enabled
    Given the stored procedure [dbo].[uspSearchCandidateResumes] is called with searchString 'developer', useInflectional 0, and useThesaurus 1
    When the query executes
    Then the results should contain resumes with synonyms of 'developer'

  Scenario: Search resumes with both inflectional and thesaurus options enabled
    Given the stored procedure [dbo].[uspSearchCandidateResumes] is called with searchString 'developer', useInflectional 1, and useThesaurus 1
    When the query executes
    Then the results should contain resumes with inflectional variations and synonyms of 'developer'
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqldeclare |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstselect |  | NA | NA |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstselect | [HUMANRESOURCES].[JOBCANDIDATE].[JobCandidateID] | NA | NA | [HUMANRESOURCES].[JOBCANDIDATE].[JobCandidateID] |  |  |  |  | [HumanResources].[JobCandidate] |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstselect |  | NA | NA |  |  |  |  |  |  |
| sstselect | [HUMANRESOURCES].[JOBCANDIDATE].[JobCandidateID] | NA | NA | [HUMANRESOURCES].[JOBCANDIDATE].[JobCandidateID] |  |  |  |  | [HumanResources].[JobCandidate] |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstselect |  | NA | NA |  |  |  |  |  |  |
| sstselect | [HUMANRESOURCES].[JOBCANDIDATE].[JobCandidateID] | NA | NA | [HUMANRESOURCES].[JOBCANDIDATE].[JobCandidateID] |  |  |  |  | [HumanResources].[JobCandidate] |
| sstselect |  | NA | NA |  |  |  |  |  |  |
| sstselect | [HUMANRESOURCES].[JOBCANDIDATE].[JobCandidateID] | NA | NA | [HUMANRESOURCES].[JOBCANDIDATE].[JobCandidateID] |  |  |  |  | [HumanResources].[JobCandidate] |

