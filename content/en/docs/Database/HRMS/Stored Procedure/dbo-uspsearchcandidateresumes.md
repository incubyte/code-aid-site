---
title: "dbo.uspSearchCandidateResumes"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins | Where Clause | Table Name |
|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |
| sstmssqldeclare |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |
| sstselect | @language =CONVERT(int, serverproperty('lcid')) | NA | NA |  |  |  |
| sstmssqlif |  |  |  |  |  |  |
| sstselect | [JobCandidateID], [RANK] | NA | NA | [JobCandidateID], [KEY] |  | [HumanResources].[JobCandidate], FREETEXTTABLE([HumanResources].[JobCandidate],*, @searchString,LANGUAGE @language) |
| sstmssqlif |  |  |  |  |  |  |
| sstselect | @string ='FORMSOF(THESAURUS,"'+@searchString +'"'+')' | NA | NA |  |  |  |
| sstselect | [JobCandidateID], [RANK] | NA | NA | [JobCandidateID], [KEY] |  | [HumanResources].[JobCandidate], CONTAINSTABLE([HumanResources].[JobCandidate],*, @string,LANGUAGE @language) |
| sstmssqlif |  |  |  |  |  |  |
| sstselect | @string ='FORMSOF(INFLECTIONAL,"'+@searchString +'"'+')' | NA | NA |  |  |  |
| sstselect | [JobCandidateID], [RANK] | NA | NA | [JobCandidateID], [KEY] |  | [HumanResources].[JobCandidate], CONTAINSTABLE([HumanResources].[JobCandidate],*, @string,LANGUAGE @language) |
| sstselect | @string='"'+@searchString +'"' | NA | NA |  |  |  |
| sstselect | [JobCandidateID], [RANK] | NA | NA | [JobCandidateID], [KEY] |  | [HumanResources].[JobCandidate], CONTAINSTABLE([HumanResources].[JobCandidate],*,@string,LANGUAGE @language) |

## Overview

This stored procedure, `uspSearchCandidateResumes`, demonstrates an integrated full-text search feature for searching candidate resumes in the database.

## Details

The procedure accepts the following parameters:

1. `@searchString`: a search query typed by the user.
2. `@useInflectional`: a boolean flag for whether to use inflectional forms of words.
3. `@useThesaurus`: a boolean flag for whether to use a thesaurus for finding synonyms.
4. `@language`: the language to be used in the search; default is 0.

Based on the parameter values, the procedure dynamically constructs a search query using `FREETEXTTABLE` or `CONTAINSTABLE` functions and executes the SQL statement accordingly.

## Information on data

The stored procedure operates on the `[HumanResources].[JobCandidate]` table.

## Information on the tables

The `[HumanResources].[JobCandidate]` table has the following columns:

1. `JobCandidateID`: an identifier for a job candidate.
2. `Resume`: the resume text of a job candidate (where the full-text search is performed).

## Possible optimization opportunities

1. Analyze the performance of the full-text search and fine-tune the index settings for a more optimized search experience.
2. Implement caching if the search query remains the same, to serve results faster.

## Possible bugs

1. If the stored procedure doesn't return any results or returns unexpected results, it might be related to the full-text search settings.

## Risk

1. If the stored procedure contains a heavy amount of data or huge resumes, the performance might be impacted.
2. The stored procedure is read-only and has no risks of changing data.

## Code Complexity

The code complexity is low-to-medium. This procedure involves basic SQL statements and conditional statements.

## Refactoring Opportunities

1. Implement helper or utility functions to handle different cases of full-text search.
2. Consider using Temporary Tables or CTE (Common Table Expressions) for more complex queries.

## User Acceptance Criteria

```Gherkin
Feature: JobCandidate Resume Search
  Scenario: User searches for a keyword with inflectional and thesaurus options
    Given the user specifies a searchString keyword
    And the user enables the useInflectional option
    And the user enables the useThesaurus option
    When the user executes the uspSearchCandidateResumes stored procedure
    Then the stored procedure should return the relevant JobCandidateID and RANK

  Scenario: User searches for a keyword with only thesaurus option
    Given the user specifies searchString keyword
    And the user enables the useThesaurus option
    When the user executes the uspSearchCandidateResumes stored procedure
    Then the stored procedure should return the relevant JobCandidateID and RANK

  Scenario: User searches for a keyword with only inflectional option
    Given the user specifies searchString keyword
    And the user enables the useInflectional option
    When the user executes the uspSearchCandidateResumes stored procedure
    Then the stored procedure should return the relevant JobCandidateID and RANK

  Scenario: User searches for a keyword without any additional options
    Given the user specifies searchString keyword
    When the user executes the uspSearchCandidateResumes stored procedure
    Then the stored procedure should return the relevant JobCandidateID and RANK
```

