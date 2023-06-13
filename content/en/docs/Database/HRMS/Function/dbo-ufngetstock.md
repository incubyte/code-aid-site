---
title: "dbo.ufnGetStock"
linkTitle: "dbo.ufnGetStock"
description: "dbo.ufnGetStock"
---

# Functions

## [dbo].[ufnGetStock]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 18
- **Code Complexity:** 3
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @ProductID | INT | IN |
| RETURN | INT | OUT |

{{< details "Sql Code" >}}
```sql

CREATE FUNCTION [dbo].[ufnGetStock](@ProductID [int])
RETURNS [int] 
AS 
-- Returns the stock level for the product. This function is used internally only
BEGIN
    DECLARE @ret int;
    
    SELECT @ret = SUM(p.[Quantity]) 
    FROM [Production].[ProductInventory] p 
    WHERE p.[ProductID] = @ProductID 
        AND p.[LocationID] = '6'; -- Only look at inventory in the misc storage
    
    IF (@ret IS NULL) 
        SET @ret = 0
    
    RETURN @ret
END;

```
{{< /details >}}
## Overview
This document provides markdown documentation for the `dbo.ufnGetStock` function in the database. The function takes a ProductID (`int`) as input and returns the stock level (`int`) for the product.

## Details
The `dbo.ufnGetStock` function is an internally used function that queries the `Production.ProductInventory` table to calculate the stock level of a product based on the `ProductID`.

**Function Signature:**
```sql
CREATE FUNCTION [dbo].[ufnGetStock](@ProductID [int])
RETURNS [int]
```

## Information on Data
The data used in the calculation of stock level involves the `Quantity` field of the `Production.ProductInventory` table.

## Information on the Tables
1. `Production.ProductInventory`: This table contains information about the product inventory with fields such as `ProductID`, `LocationID`, and `Quantity`. The function fetches data from this table to calculate the stock level.

## Possible Optimization Opportunities
No optimization opportunities have been identified for this function.

## Possible Bugs
No possible bugs have been identified for this function.

## Risk
The function does not utilize a WHERE clause as it calculates the stock using the `ProductID` and `LocationID` in the query. Therefore, there is no risk of exposing sensitive data or incorrect results.

## Code Complexity
The code complexity of the function is relatively low as it only consists of a single SELECT statement.

## Refactoring Opportunities
No refactoring opportunities have been identified for this function.

## User Acceptance Criteria
```
Feature: Get Product Stock Level
  As a database assistant
  I want to calculate the stock level of a product
  So that the system has up-to-date information on stock levels

Scenario: Calculate stock level for a valid ProductID
  Given a ProductID exists in the Production.ProductInventory table
    And the LocationID is set to '6'
  When the dbo.ufnGetStock function is executed with the ProductID
  Then the stock level of the product should be returned as an integer

Scenario: Calculate stock level for a non-existent ProductID
  Given a ProductID does not exist in the Production.ProductInventory table
  When the dbo.ufnGetStock function is executed with the ProductID
  Then the stock level should be returned as 0
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | [PRODUCTION].[PRODUCTINVENTORY].[Quantity] | NA | NA |  | [PRODUCTION].[PRODUCTINVENTORY].[ProductID], [PRODUCTION].[PRODUCTINVENTORY].[LocationID] |  |  |  | [Production].[ProductInventory] |

