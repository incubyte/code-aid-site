---
title: "ufnGetProductListPrice"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Object Type   |       No of Lines      |  Tables Involved |
|----------|:-------------:|------:|
| Function |  12 | Production.Product,Production.ProductListPriceHistory |

## Overview
- This database object is a user-defined function named `[dbo].[ufnGetProductListPrice]`.
- The function accepts two parameters:
    1. @ProductID of type [int]
    2. @OrderDate of type [datetime]
- The function returns a value of type [money], which represents the list price of a specific product on a certain date.

## Details
- The function starts by declaring a variable named `@ListPrice` with data type money.
- It then performs a SELECT statement to get the list price for the specified product and date.
- The SELECT statement involves an INNER JOIN between two tables: `[Production].[Product]` and `[Production].[ProductListPriceHistory]`.
- The conditions for the INNER JOIN are as follows:
    1. `p.[ProductID]` equals `plph.[ProductID]`
    2. `p.[ProductID]` equals the parameter `@ProductID`
    3. `@OrderDate` is between plph.`[StartDate]` and the COALESCE of plph.`[EndDate]` and `CONVERT(datetime, '99991231', 112)`
- The function finally returns the `@ListPrice` variable.

## Information on data
- The [Production].[Product] table stores products' information.
- The [Production].[ProductListPriceHistory] table stores the history of the list prices of products.

## Information on the tables
### [Production].[Product] table
- ProductID [int]: Primary Key, uniquely identifies each product
- ...

### [Production].[ProductListPriceHistory] table
- ProductID [int]: Foreign Key, refers to the ProductID of the [Production].[Product]
- StartDate [datetime]: The start date of the list price period
- EndDate [datetime]: The end date of the list price period (nullable)
- ListPrice [money]: The list price of the product during the specified period
- ...

## Possible optimization opportunities
- Creating an index on the `[Production].[ProductListPriceHistory]` table, covering the columns `ProductID`, `StartDate`, and `EndDate`, can improve the performance of the function by reducing the time taken to scan the table.

## Possible bugs
- No apparent bugs.

## Risk
1. Running the query without a WHERE clause can lead to unnecessary resource consumption.

```sql
SELECT * FROM [Production].[ProductListPriceHistory];
```

## Code Complexity
- The complexity is relatively low since it consists of a single SELECT statement with an INNER JOIN and a few conditions.

## Refactoring Opportunities
- One possible opportunity for refactoring is to use a window function (e.g., `ROW_NUMBER()`) with a PARTITION BY clause, followed by filtering only on the latest record. This can provide a more efficient and readable solution.