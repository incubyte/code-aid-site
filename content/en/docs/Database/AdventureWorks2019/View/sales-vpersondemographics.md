---
title: "Sales.vPersonDemographics"
linkTitle: "Sales.vPersonDemographics"
description: "Sales.vPersonDemographics"
---

# Views

## [Sales].[vPersonDemographics]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 33
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Sales].[vPersonDemographics] 
AS 
SELECT 
    p.[BusinessEntityID] 
    ,[IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        TotalPurchaseYTD[1]', 'money') AS [TotalPurchaseYTD] 
    ,CONVERT(datetime, REPLACE([IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        DateFirstPurchase[1]', 'nvarchar(20)') ,'Z', ''), 101) AS [DateFirstPurchase] 
    ,CONVERT(datetime, REPLACE([IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        BirthDate[1]', 'nvarchar(20)') ,'Z', ''), 101) AS [BirthDate] 
    ,[IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        MaritalStatus[1]', 'nvarchar(1)') AS [MaritalStatus] 
    ,[IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        YearlyIncome[1]', 'nvarchar(30)') AS [YearlyIncome] 
    ,[IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        Gender[1]', 'nvarchar(1)') AS [Gender] 
    ,[IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        TotalChildren[1]', 'integer') AS [TotalChildren] 
    ,[IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        NumberChildrenAtHome[1]', 'integer') AS [NumberChildrenAtHome] 
    ,[IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        Education[1]', 'nvarchar(30)') AS [Education] 
    ,[IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        Occupation[1]', 'nvarchar(30)') AS [Occupation] 
    ,[IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        HomeOwnerFlag[1]', 'bit') AS [HomeOwnerFlag] 
    ,[IndividualSurvey].[ref].[value](N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
        NumberCarsOwned[1]', 'integer') AS [NumberCarsOwned] 
FROM [Person].[Person] p 
CROSS APPLY p.[Demographics].nodes(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
    /IndividualSurvey') AS [IndividualSurvey](ref) 
WHERE [Demographics] IS NOT NULL;

```
{{< /details >}}
## Overview

This view, `Sales.vPersonDemographics`, provides demographic information of individuals who are customers by extracting specific demographic details from the `Person.Person` table.

## Details

- This view selects columns from the `Person.Person` table and performs a cross apply operation on the `Demographics` column to extract data from the XML content.
- The view returns details such as total purchases, date of first purchase, birth date, marital status, yearly income, gender, total children, number of children at home, education, occupation, home owner flag, and number of cars owned.

## Information on data

The view gathers data from the `Person.Person` table, specifically from the `BusinessEntityID` and `Demographics` columns.

## Information on the tables

1. Person.Person
    - Stores personal information such as name, address, and email.
    - Includes every person that the company has contact with, including customers, employees, and vendors.

## Possible optimization opportunities

- None

## Possible bugs

- None

## Risk

- Running queries without a WHERE clause: None in the current query.

## Code Complexity

The query uses XML functions to extract demographic data from the `IndividualSurvey` nodes. It has a moderate level of complexity due to the use of XML namespaces and XQuery expressions.

## Refactoring Opportunities

- None

## User Acceptance Criteria

```
Feature: Sales.vPersonDemographics view
  The Sales.vPersonDemographics view provides demographic information of individuals who are customers.

  Scenario: A user queries demographic information of individuals
    Given the Sales.vPersonDemographics view exists
    When the user selects all rows from the view
    Then the result should contain demographic information of individuals with non-null Demographics data

  Scenario Outline: A user filters demographic information by a specific column
    Given the Sales.vPersonDemographics view exists
    When the user selects all rows from the view with a specific <column_name> value
    Then the result should contain demographic information of individuals that match the <column_name> value

    Examples:
      | column_name       |
      | Gender            |
      | MaritalStatus     |
      | YearlyIncome      |
      | TotalChildren     |
      | NumberCarsOwned   |
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstselect | [PERSON].[PERSON].[BusinessEntityID] | NA | NA |  | [PERSON].[PERSON].[Demographics] |  |  |  | [Person].[Person] |

