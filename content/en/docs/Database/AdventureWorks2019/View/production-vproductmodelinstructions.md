---
title: "Production.vProductModelInstructions"
linkTitle: "Production.vProductModelInstructions"
description: "Production.vProductModelInstructions"
---

# Views

## [Production].[vProductModelInstructions]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 21
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Production].[vProductModelInstructions] 
AS 
SELECT 
    [ProductModelID] 
    ,[Name] 
    ,[Instructions].value(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ProductModelManuInstructions"; 
        (/root/text())[1]', 'nvarchar(max)') AS [Instructions] 
    ,[MfgInstructions].ref.value('@LocationID[1]', 'int') AS [LocationID] 
    ,[MfgInstructions].ref.value('@SetupHours[1]', 'decimal(9, 4)') AS [SetupHours] 
    ,[MfgInstructions].ref.value('@MachineHours[1]', 'decimal(9, 4)') AS [MachineHours] 
    ,[MfgInstructions].ref.value('@LaborHours[1]', 'decimal(9, 4)') AS [LaborHours] 
    ,[MfgInstructions].ref.value('@LotSize[1]', 'int') AS [LotSize] 
    ,[Steps].ref.value('string(.)[1]', 'nvarchar(1024)') AS [Step] 
    ,[rowguid] 
    ,[ModifiedDate]
FROM [Production].[ProductModel] 
CROSS APPLY [Instructions].nodes(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ProductModelManuInstructions"; 
    /root/Location') MfgInstructions(ref)
CROSS APPLY [MfgInstructions].ref.nodes('declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ProductModelManuInstructions"; 
    step') Steps(ref);

```
{{< /details >}}
## Overview
The following SQL code creates a view named `vProductModelInstructions` under the `Production` schema. This view returns manufacturing instructions for product models, including location, setup hours, machine hours, labor hours, lot size, and step details.

## Details
1. This view is created using a `SELECT` statement with a combination of base table, `Production.ProductModel`, and two `CROSS APPLY` functions to extract XML data.
2. The XML data is stored in the `Instructions` column of the `Production.ProductModel` table and contains information about manufacturing instructions.

## Information on Data
The key data columns in this view are:

1. ProductModelID
2. Name
3. Instructions
4. LocationID
5. SetupHours
6. MachineHours
7. LaborHours
8. LotSize
9. Step
10. rowguid
11. ModifiedDate

## Information on the Tables
1. Production.ProductModel: This table contains the product model details and manufacturing instructions in XML format.

## Possible Optimization Opportunities
1. Instead of using XML data type in the `Instructions` column, consider storing the data in a structured table format. It will make querying and manipulation of the data easier and possibly faster.

## Possible Bugs
1. There are no bugs detected in the SQL code.

## Risk
1. There are no `WHERE` clauses in the code. However, since it is a view, the risk of running it without filters is low as the user selects a subset of columns and rows while using the view.
2. The view depends on an XML schema which, if changed, may affect the functionality of the view.

## Code Complexity
1. The code has a moderate level of complexity due to the use of `CROSS APPLY` functions and XML namespace declaration.

## Refactoring Opportunities
1. Replace the XML data type in the base table with a structured table format to simplify the code and improve performance.

## User Acceptance Criteria

Feature: vProductModelInstructions View
Scenario: Retrieve manufacturing instructions for product models
  Given a user wants to get manufacturing instructions for a certain product model
  When they select columns from the vProductModelInstructions view
  Then they should receive the expected information:
    - ProductModelID
    - Name
    - Instructions
    - LocationID
    - SetupHours
    - MachineHours
    - LaborHours
    - LotSize
    - Step
    - rowguid
    - ModifiedDate
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstselect | [PRODUCTION].[PRODUCTMODEL].[Name], [PRODUCTION].[PRODUCTMODEL].[rowguid], [PRODUCTION].[PRODUCTMODEL].[ProductModelID], [PRODUCTION].[PRODUCTMODEL].[ModifiedDate] | NA | NA |  |  |  |  |  | [Production].[ProductModel] |

