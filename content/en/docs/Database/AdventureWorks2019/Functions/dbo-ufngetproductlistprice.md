---
title: "dbo.ufnGetProductListPrice"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

## Overview
The `ufnGetProductListPrice` function is a user-defined scalar function in the `dbo` schema that returns the list price of a product based on the given product ID and order date.

## Details

### Input
1. @ProductID (int): The Product ID to retrieve the list price for.
2. @OrderDate (datetime): The date for which the price should be displayed.

### Output
Returns a single value of datatype 'money' indicating the list price of the given Product ID and Order Date.

### Code
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

## Information on data
The function retrieves data from the following tables:
1. Production.Product
2. Production.ProductListPriceHistory

## Information on the tables
1. Production.Product: This table contains all the product information. Contains columns like ProductID, Name, ProductNumber, etc.
2. Production.ProductListPriceHistory: This table contains the history of list prices for each product. Contains columns like ProductID, StartDate, EndDate, and ListPrice.

## Possible optimization opportunities
The current function fetches list price using an inner join and conditional statement. It may be possible to speed up performance by optimizing this join or by using more efficient date-handling techniques.

## Possible bugs
None detected.

## Risk
1. If the function is called without passing a value to `@OrderDate`, it may not return accurate results.
2. It is essential to make sure the correct date format is used when passing the order date, or the function may not give accurate results.

## Code Complexity
The code is relatively simple and easy to understand.

## Refactoring Opportunities
1. If dates are used more often, consider creating a helper function to handle date formatting.
2. The handling of the end date can be improved to avoid hardcoding a future date. Instead, rely on default date range values or null checks.

## User Acceptance Criteria
```gherkin
Scenario: Get the list price for a given Product ID and Order Date
Given I have a valid Product ID and Order Date
When I execute the ufnGetProductListPrice function
Then I should get the list price for that Product ID and Order Date

Scenario: Get the list price when the end date is not specified
Given I have a valid Product ID and Order Date
And the end date is not specified in the ProductListPriceHistory table
When I execute the ufnGetProductListPrice function
Then I should get the list price for that Product ID and Order Date

Scenario: Get the list price when the Order Date is not within the price history date range
Given I have a valid Product ID and Order Date
And the Order Date is not within the date range specified in the ProductListPriceHistory table
When I execute the ufnGetProductListPrice function
Then I should get no result or an error depending on the implementation
```
