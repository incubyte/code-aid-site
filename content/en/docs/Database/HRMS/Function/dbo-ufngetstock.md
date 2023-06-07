---
title: "dbo.ufnGetStock"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins | Where Clause | Table Name |
|---|---|---|---|---|---|---|
| sstmssqldeclare |  |  |  |  |  |  |
| sstselect | @ret = SUM(p.[Quantity]) | NA | NA |  | , [ProductID], [LocationID] | [Production].[ProductInventory] |
| sstmssqlif |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |

## Overview

The `ufnGetStock` function is a user-defined function that returns the stock level for a specific product. This function is intended for internal use only.

## Details

**Parameters:**
1. `@ProductID [int]` - The ProductID for which the stock level is required.

**Returns:**
- `[int]` - The stock level for the given ProductID.

## Information on Data

This function refers to the `[Production].[ProductInventory]` table to fetch the stock information.

### Information on the Tables

#### [Production].[ProductInventory]

Columns:
- ProductID [int] - Unique ID of a product
- LocationID [int] - Unique ID of a location
- Quantity [int] - Quantity of a product in a specific location

## Possible Optimization Opportunities

There's an opportunity to optimize the code by replacing the `IF` statement with a `COALESCE` function for better readability.

## Possible Bugs

Currently, none.

## Risk

* Running the SELECT query without a WHERE clause or specifying the LocationID might lead to displaying stock levels from other storage locations or incorrect results.

## Code Complexity

The code consists of a single SELECT statement with a WHERE clause and an IF statement. The complexity of this function is low.

## Refactoring Opportunities

Refactoring the function to replace the current IF statement with a COALESCE function can improve readability.

```sql
CREATE FUNCTION [dbo].[ufnGetStock](@ProductID [int])
RETURNS [int] 
AS 
-- Returns the stock level for the product. This function is used internally only
BEGIN
    DECLARE @ret int;
    
    SELECT @ret = COALESCE(SUM(p.[Quantity]), 0)
    FROM [Production].[ProductInventory] p 
    WHERE p.[ProductID] = @ProductID 
        AND p.[LocationID] = '6'; -- Only look at inventory in the misc storage
    
    RETURN @ret
END;
```

## User Acceptance Criteria

### Gherkin Scripts

```gherkin
Feature: Stock Level Retrieval Function

  Scenario: Retrieve the stock level for a specified product ID
    Given a ProductID is provided as input
    When the function ufnGetStock is called
    Then the stock level for the product should be returned
   
  Scenario: Retrieve the stock level for an invalid product ID
    Given an invalid ProductID is provided as input
    When the function ufnGetStock is called
    Then the stock level should be returned as 0
```
