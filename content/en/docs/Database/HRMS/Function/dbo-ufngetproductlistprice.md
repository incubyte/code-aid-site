---
title: "dbo.ufnGetProductListPrice"
linkTitle: "dbo.ufnGetProductListPrice"
description: "dbo.ufnGetProductListPrice"
---

# Functions

## [dbo].[ufnGetProductListPrice]
### Summary


- **Number of Tables Accessed:** 2
- **Lines of Code:** 16
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

CREATE FUNCTION [dbo].[ufnGetProductListPrice](@ProductID [int], @OrderDate [datetime])
RETURNS [money] 
AS 
BEGIN
    DECLARE @ListPrice money;

    SELECT @ListPrice = plph.[ListPrice] 
    FROM [Production].[Product] p 
        INNER JOIN [Production].[ProductListPriceHistory] plph 
        ON p.[ProductID] = plph.[ProductID] 
            AND p.[ProductID] = @ProductID 
            AND @OrderDate BETWEEN plph.[StartDate] AND COALESCE(plph.[EndDate], CONVERT(datetime, '99991231', 112)); -- Make sure we get all the prices!

    RETURN @ListPrice;
END;

```
{{< /details >}}
## 1. Overview

This documentation provides an in-depth look into the `ufnGetProductListPrice` function within the database. The function retrieves the list price of a product based on the product ID and order date. It returns the list price as a `money` data type.

## 2. Details

The following SQL code defines the `ufnGetProductListPrice` function:

```sql
CREATE FUNCTION [dbo].[ufnGetProductListPrice](@ProductID [int], @OrderDate [datetime])
RETURNS [money] 
AS 
BEGIN
    DECLARE @ListPrice money;

    SELECT @ListPrice = plph.[ListPrice] 
    FROM [Production].[Product] p 
        INNER JOIN [Production].[ProductListPriceHistory] plph 
        ON p.[ProductID] = plph.[ProductID] 
            AND p.[ProductID] = @ProductID 
            AND @OrderDate BETWEEN plph.[StartDate] AND COALESCE(plph.[EndDate], CONVERT(datetime, '99991231', 112));

    RETURN @ListPrice;
END;
```

## 3. Information on Data

The function uses the following input parameters:

1. @ProductID [int]: The product identifier
2. @OrderDate [datetime]: The order date for the product

The function returns a single value: the list price as a `money` data type.

## 4. Information on the Tables

The function relies on two tables:

1. [Production].[Product]: Stores information about the products
2. [Production].[ProductListPriceHistory]: Stores the history of list prices and their effective date range for each product

## 5. Possible Optimization Opportunities

Currently, there are no apparent optimization opportunities; however, it's critical to monitor this function's performance over time. Review the query plan and execution times to determine if new indexes or other optimizations are needed.

## 6. Possible Bugs

There are no known bugs in this function.

## 7. Risk

Given that this function does not contain a WHERE clause, it doesn't present any risks in terms of high RAM usage or slow performance. Always ensure that the input parameters are valid and correctly formatted to avoid errors.

## 8. Code Complexity

The code complexity of this function is relatively low, with one JOIN operation and a simple SELECT statement. The function's purpose is clear, and its logic is easy to understand.

## 9. Refactoring Opportunities

There are no immediate refactoring opportunities for this function. The function is adequately concise and efficient, and its purpose is well-defined.

## 10. User Acceptance Criteria

Create Gherkin scripts to define the acceptance criteria for the `ufnGetProductListPrice` function:

```gherkin
Feature: Get Product List Price
  Scenario: Fetch a valid product list price
    Given a valid product ID and order date
    When the function ufnGetProductListPrice is called
    Then a list price should be returned as a money data type
  
  Scenario: Fetch a product list price for an unknown product ID
    Given an unknown product ID
    When the function ufnGetProductListPrice is called
    Then a NULL value should be returned
  
  Scenario: Fetch a product list price for an invalid order date
    Given a valid product ID and an invalid order date
    When the function ufnGetProductListPrice is called
    Then an error should be returned
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | [PRODUCTION].[PRODUCTLISTPRICEHISTORY].[ListPrice] | NA | NA | [PRODUCTION].[PRODUCT].[ProductID], [PRODUCTION].[PRODUCTLISTPRICEHISTORY].[EndDate], [PRODUCTION].[PRODUCTLISTPRICEHISTORY].[ProductID], [PRODUCTION].[PRODUCTLISTPRICEHISTORY].[StartDate] |  |  |  |  | [Production].[ProductListPriceHistory], [Production].[Product] |

