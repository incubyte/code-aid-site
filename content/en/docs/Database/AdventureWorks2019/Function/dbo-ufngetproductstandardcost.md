---
title: "dbo.ufnGetProductStandardCost"
linkTitle: "dbo.ufnGetProductStandardCost"
description: "dbo.ufnGetProductStandardCost"
---

# Functions

## [dbo].[ufnGetProductStandardCost]
### Summary


- **Number of Tables Accessed:** 2
- **Lines of Code:** 17
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [PRODUCTION].[PRODUCTCOSTHISTORY]| [EndDate] | sstselect | JOIN |


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @ProductID | INT | IN |
| @OrderDate | DATETIME | IN |
| RETURN | MONEY | OUT |

{{< details "Sql Code" >}}
```sql

CREATE FUNCTION [dbo].[ufnGetProductStandardCost](@ProductID [int], @OrderDate [datetime])
RETURNS [money] 
AS 
-- Returns the standard cost for the product on a specific date.
BEGIN
    DECLARE @StandardCost money;

    SELECT @StandardCost = pch.[StandardCost] 
    FROM [Production].[Product] p 
        INNER JOIN [Production].[ProductCostHistory] pch 
        ON p.[ProductID] = pch.[ProductID] 
            AND p.[ProductID] = @ProductID 
            AND @OrderDate BETWEEN pch.[StartDate] AND COALESCE(pch.[EndDate], CONVERT(datetime, '99991231', 112)); -- Make sure we get all the prices!

    RETURN @StandardCost;
END;

```
{{< /details >}}
## Overview

This document describes the `dbo.ufnGetProductStandardCost` function in the provided database. The function determines the standard cost of a product based on its `ProductID` and a specified `OrderDate`.

## Details

### Function Signature

```sql
CREATE FUNCTION [dbo].[ufnGetProductStandardCost](@ProductID [int], @OrderDate [datetime])
RETURNS [money]
```

### Parameters

1. `@ProductID` - An integer representing a product's unique identifier.
2. `@OrderDate` - The date when the order is placed for the product.

### Information on data

The function uses the following tables:

1. `[Production].[Product]`
2. `[Production].[ProductCostHistory]`

#### Information on the tables

- `[Production].[Product]` table:

  - Stores product related information, such as `ProductID` and `Name`.

- `[Production].[ProductCostHistory]` table:

  - Stores historical cost data for each product, such as `StartDate`, `EndDate`, and `StandardCost`.

### Possible optimization opportunities

1. Add proper indexing to the tables to speed up the lookup process.

### Possible bugs

None identified.

### Risk

1. If the function is called without a valid `ProductID` or `OrderDate`, the query might not return any data.
2. Performance issues might occur if the function is used extensively for large datasets.

### Code Complexity

The code complexity for this function is low. It contains a single SELECT statement to fetch the standard cost for the product.

### Refactoring Opportunities

1. Add proper error handling and messaging to handle cases when the function is called with invalid parameters.

## User Acceptance Criteria

### Gherkin Scripts

```gherkin
Feature: Standard cost calculation for a product by order date
  Scenario: A user provides a valid ProductID and OrderDate
    Given a ProductID and an OrderDate
    When dbo.ufnGetProductStandardCost is called with these parameters
    Then it should return the appropriate standard cost for that product and date

  Scenario: A user provides an invalid ProductID or OrderDate
    Given an invalid ProductID or OrderDate
    When dbo.ufnGetProductStandardCost is called with these parameters
    Then it should return an appropriate error message or handle the situation gracefully
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqldeclare |  |  |  |  |  |  |  |  |  |
| sstselect | [PRODUCTION].[PRODUCTCOSTHISTORY].[StandardCost] | NA | NA | [PRODUCTION].[PRODUCT].[ProductID], [PRODUCTION].[PRODUCTCOSTHISTORY].[ProductID], [PRODUCTION].[PRODUCTCOSTHISTORY].[StartDate], [PRODUCTION].[PRODUCTCOSTHISTORY].[EndDate] |  |  |  |  | [Production].[Product], [Production].[ProductCostHistory] |
| sstmssqlreturn |  |  |  |  |  |  |  |  |  |

