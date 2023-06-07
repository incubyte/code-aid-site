---
title: "Sales.vStoreWithDemographics"
linkTitle: "Sales.vStoreWithDemographics"
description: "Sales.vStoreWithDemographics"
---

# Views

## [Sales].[vStoreWithDemographics]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 26
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Sales].[vStoreWithDemographics] AS 
SELECT 
    s.[BusinessEntityID] 
    ,s.[Name] 
    ,s.[Demographics].value('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/StoreSurvey"; 
        (/StoreSurvey/AnnualSales)[1]', 'money') AS [AnnualSales] 
    ,s.[Demographics].value('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/StoreSurvey"; 
        (/StoreSurvey/AnnualRevenue)[1]', 'money') AS [AnnualRevenue] 
    ,s.[Demographics].value('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/StoreSurvey"; 
        (/StoreSurvey/BankName)[1]', 'nvarchar(50)') AS [BankName] 
    ,s.[Demographics].value('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/StoreSurvey"; 
        (/StoreSurvey/BusinessType)[1]', 'nvarchar(5)') AS [BusinessType] 
    ,s.[Demographics].value('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/StoreSurvey"; 
        (/StoreSurvey/YearOpened)[1]', 'integer') AS [YearOpened] 
    ,s.[Demographics].value('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/StoreSurvey"; 
        (/StoreSurvey/Specialty)[1]', 'nvarchar(50)') AS [Specialty] 
    ,s.[Demographics].value('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/StoreSurvey"; 
        (/StoreSurvey/SquareFeet)[1]', 'integer') AS [SquareFeet] 
    ,s.[Demographics].value('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/StoreSurvey"; 
        (/StoreSurvey/Brands)[1]', 'nvarchar(30)') AS [Brands] 
    ,s.[Demographics].value('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/StoreSurvey"; 
        (/StoreSurvey/Internet)[1]', 'nvarchar(30)') AS [Internet] 
    ,s.[Demographics].value('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/StoreSurvey"; 
        (/StoreSurvey/NumberEmployees)[1]', 'integer') AS [NumberEmployees] 
FROM [Sales].[Store] s;

```
{{< /details >}}
## Overview

This script creates a view named `Sales.vStoreWithDemographics` that pulls information from the `Sales.Store` table and extracts demographics from an XML column to provide a detailed view of store data.

## Details

The view is created using a `SELECT` statment that includes several XPath queries to extract information from the `Demographics` XML column, such as Annual Sales, Annual Revenue, Bank Name, Business Type, and so on. The view allows users to access the key demographics information in an easy-to-query tabular format.

## Information on data

The data in this view comes from the `Sales.Store` table, which contains information about stores. The `Demographics` column of this table stores an XML representation of store demographics.

## Information on the tables

The only table used in this view is `Sales.Store`. The `Sales.Store` table contains:

- `BusinessEntityID` as an identifier
- `Name` of the store
- `Demographics`, an XML column with demographics data

## Possible optimization opportunities

Since we are only dependent on a single table, `Sales.Store`, and there are no complex joins and aggregations, optimization opportunities are minimal.

## Possible bugs

The XML manipulation in the select statement could cause issues if the XML schema changes, leading to errors or incorrect output.

## Risk

The primary risk is modifications to the XML schema in the `Demographics` column, breaking the view's functionality. Also, as this view utilizes XPath queries to parse XML data, there's a risk related to performance, especially when dealing with a large number of rows.

## Code Complexity

The code complexity is moderate due to the multiple XPath queries used to extract demographic factors from the XML column.

```sql
s.[Demographics].value('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/StoreSurvey";
    (/StoreSurvey/AnnualSales)[1]', 'money') AS [AnnualSales]
```

## Refactoring Opportunities

Potential refactoring can be considered by simplifying the XML namespaces declaration, which can be done by extracting it to a higher scope.

## User Acceptance Criteria

1. Scenario: Retrieving store demographics

   ```
   Given I have the view Sales.vStoreWithDemographics
   When I run the query 'SELECT * FROM Sales.vStoreWithDemographics'
   Then I should receive a list of stores with their demographics data in tabular format
   ```

2. Scenario: Filtering stores by annual sales

   ```
   Given I have the view Sales.vStoreWithDemographics
   When I run the query 'SELECT * FROM Sales.vStoreWithDemographics WHERE AnnualSales > 500000'
   Then I should see a list of stores with Annual Sales greater than 500,000
   ```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstselect | [SALES].[STORE].[Name], [SALES].[STORE].[BusinessEntityID] | NA | NA |  |  |  |  |  | [Sales].[Store] |

