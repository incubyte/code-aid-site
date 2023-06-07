---
title: "dbo.ufnGetProductDealerPrice"
linkTitle: "dbo.ufnGetProductDealerPrice"
description: "dbo.ufnGetProductDealerPrice"
---

# Functions

## [dbo].[ufnGetProductDealerPrice]
### Summary


- **Number of Tables Accessed:** 2
- **Lines of Code:** 22
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [PRODUCTION].[PRODUCTLISTPRICEHISTORY]| [EndDate] | sstselect | JOIN |


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @ProductID | INT | IN |
| @OrderDate | DATETIME | IN |
| RETURN | MONEY | OUT |

{{< details "Sql Code" >}}
```sql



CREATE FUNCTION [dbo].[ufnGetProductDealerPrice](@ProductID [int], @OrderDate [datetime])
RETURNS [money] 
AS 
-- Returns the dealer price for the product on a specific date.
BEGIN
    DECLARE @DealerPrice money;
    DECLARE @DealerDiscount money;

    SET @DealerDiscount = 0.60  -- 60% of list price

    SELECT @DealerPrice = plph.[ListPrice] * @DealerDiscount 
    FROM [Production].[Product] p 
        INNER JOIN [Production].[ProductListPriceHistory] plph 
        ON p.[ProductID] = plph.[ProductID] 
            AND p.[ProductID] = @ProductID 
            AND @OrderDate BETWEEN plph.[StartDate] AND COALESCE(plph.[EndDate], CONVERT(datetime, '99991231', 112)); -- Make sure we get all the prices!

    RETURN @DealerPrice;
END;

```
{{< /details >}}
## Overview
This document provides markdown documentation for the `ufnGetProductDealerPrice` function in the database. The `ufnGetProductDealerPrice` function returns the dealer price for a specified product on a specific date.

## Details

1. Language: SQL
2. Type: User Defined Function (Scalar Function)

## Information on data

1. Input parameters:
   - @ProductID [int]: The ID of the specified product.
   - @OrderDate [datetime]: The date on which the dealer price should be determined.

2. Output data type: money

## Information on the tables

1. Production.Product:
   - An inner join is performed on the `ProductID` column.
2. Production.ProductListPriceHistory:
   - An inner join is performed on the `ProductID` column.

## Possible optimization opportunities

1. Consider creating an index on the `ProductID` and `StartDate` columns in the `ProductListPriceHistory` table to speed up the join between the two tables.

## Possible bugs

1. The current code assumes a fixed dealer discount percentage of 60% (0.60) for all products and order dates, therefore it does not account for any changes in the discount rates over time.

## Risk

1. The function runs without a WHERE clause. JOIN conditions are used for filtering instead of WHERE clause. The current implementation might lead to performance issues if the tables grow significantly in size.

## Code Complexity

1. The function contains two variable declarations and a single SELECT statement. The complexity level can be considered relatively low.

## Refactoring Opportunities

1. One potential refactoring opportunity is to allow the dealer discount rate to be passed as an input parameter instead of hardcoding the value in the function. This would make the function more flexible and adaptable to changes in business rules.

## User Acceptance Criteria

1. #### Getting product dealer price
  ```
  Given a valid ProductID and OrderDate as input
  When the function ufnGetProductDealerPrice is executed
  Then the function should return the dealer price for the specified product on the specified date
  ```

2. #### Invalid or missing ProductID
  ```
  Given an invalid or missing ProductID as input
  When the function ufnGetProductDealerPrice is executed
  Then the function should return NULL
  ```

3. #### Invalid or missing OrderDate
  ```
  Given an invalid or missing OrderDate as input
  When the function ufnGetProductDealerPrice is executed
  Then the function should return NULL
  ```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqldeclare |  |  |  |  |  |  |  |  |  |
| sstmssqldeclare |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstselect | [PRODUCTION].[PRODUCTLISTPRICEHISTORY].[ListPrice] | NA | NA | [PRODUCTION].[PRODUCT].[ProductID], [PRODUCTION].[PRODUCTLISTPRICEHISTORY].[EndDate], [PRODUCTION].[PRODUCTLISTPRICEHISTORY].[ProductID], [PRODUCTION].[PRODUCTLISTPRICEHISTORY].[StartDate] |  |  |  |  | [Production].[ProductListPriceHistory], [Production].[Product] |
| sstmssqlreturn |  |  |  |  |  |  |  |  |  |

