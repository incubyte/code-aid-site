---
title: "ufnGetProductDelaerPrice"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

## 1. Overview

This documentation provides information about the User-defined Function (UDF) `[dbo].[ufnGetProductDealerPrice]` which is created in SQL Server. The function returns the dealer price for a specific product on a specific date, calculated based on a dealer discount.

## 2. Details

### Function Signature

```sql
CREATE FUNCTION [dbo].[ufnGetProductDealerPrice](@ProductID [int], @OrderDate [datetime])
RETURNS [money]
```

### Input Parameters

1. `@ProductID`: An integer value representing the Product ID.
2. `@OrderDate`: A datetime value representing the order date.

## 3. Information on Data

The function uses data from the following tables:

1. `[Production].[Product]`
2. `[Production].[ProductListPriceHistory]`

## 4. Information on the Tables

1. `[Production].[Product]`: This table contains information about each product available for sale.
2. `[Production].[ProductListPriceHistory]`: This table contains the historical price list of each product.

## 5. Possible Optimization Opportunities

1. The dealer discount is set as a constant value `0.60`, which might not be suitable for all products. This can be improved by storing the dealer discount values in a separate table based on individual products or product categories.

## 6. Possible Bugs

There are no known bugs in the current implementation.

## 7. Risk

1. The query within the function runs without a `WHERE` clause. This might cause performance issues if the dataset is large.
```sql
-- Risk: No WHERE clause on this query
SELECT @DealerPrice = plph.[ListPrice] * @DealerDiscount 
FROM [Production].[Product] p 
```   

## 8. Code Complexity

The code complexity of the function is low, with only a single `SELECT` statement.

## 9. Refactoring Opportunities

1. Consider storing the dealer discount values in a separate table. With this, the function can be modified to fetch the discount values for each product, rather than using a static value.