---
title: "ufnGetProductStandardCost"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Object Type   | No of Lines | Tables Involved |
|----------|:-------------:|------:|
| Function | 14 | Production.Product, Production.ProductCostHistory |

## Overview
This user-defined function, `ufnGetProductStandardCost`, takes a `ProductID` and an `OrderDate` as input parameters and returns the standard cost of the product on the given date.

## Details

### Input Parameters

1. `@ProductID`: An integer representing the unique identifier of the product.
2. `@OrderDate`: A datetime value representing the date for which the standard cost is requested.

### Return Type
The function returns a `money` datatype representing the standard cost of the product.

## Information on Data

The function uses data from the following tables:

1. `Production.Product`: Contains information about available products. Utilized columns include:
    - `ProductID`: Primary key for the table; unique identifier for a product.

2. `Production.ProductCostHistory`: Contains the history of standard costs for each product. Utilized columns include:
    - `ProductID`: Foreign key that references `Product.ProductID`.
    - `StandardCost`: The standard cost of the product.
    - `StartDate`: The start date when the standard cost became effective.
    - `EndDate`: The end date when the standard cost became ineffective (nullable).

## Information on the Tables

### Production.Product

- Columns:
    1. `ProductID`
    2. ...

### Production.ProductCostHistory

- Columns:
    1. `ProductID`
    2. `StandardCost`
    3. `StartDate`
    4. `EndDate`

## Possible Optimization Opportunities
None

## Possible Bugs
None

## Risk

### Query without WHERE Clause
There are no queries without a WHERE clause.

## Code Complexity
The code complexity is relatively low, as it only involves a single SELECT statement to fetch the `StandardCost` based on the input parameters.

## Refactoring Opportunities
No refactoring opportunities detected as the code is straightforward and easy to understand.