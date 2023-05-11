---
title: "dbo.ufnGetProductStandardCost"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

## 1. Overview
This markdown documentation describes the database function `[dbo].[ufnGetProductStandardCost]`, which returns the standard cost of a product on a specific date.

## 2. Details

### 2.1 Function signature
```sql
CREATE FUNCTION [dbo].[ufnGetProductStandardCost](@ProductID [int], @OrderDate [datetime])
RETURNS [money]
```

### 2.2 Parameters
1. `@ProductID [int]`: The identifier of the product for which the standard cost is needed.
2. `@OrderDate [datetime]`: The date on which the standard cost should be returned.

## 3. Information on data

### 3.1 Used tables
1. `[Production].[Product]`
2. `[Production].[ProductCostHistory]`

## 4. Information on the tables

### 4.1 Table: `[Production].[Product]`
1. `ProductID [int]`: Unique identifier of the product.
2. *Other columns are not relevant for this function.*

### 4.2 Table: `[Production].[ProductCostHistory]`
1. `ProductID [int]`: Unique identifier of the product this cost history belongs to.
2. `StandardCost [money]`: Standard cost of the product.
3. `StartDate [datetime]`: Start date of the standard cost validity period.
4. `EndDate [datetime]`: End date of the standard cost validity period. Null if the product is no longer available.

## 5. Possible optimization opportunities
None identified.

## 6. Possible bugs
None identified.

## 7. Risk
- If the query returns multiple rows of data, the function takes the last standard cost encountered. This may or may not be the desired behavior, depending on the data in the tables.

## 8. Code Complexity
The code complexity is low as it contains only a single `SELECT` statement.

## 9. Refactoring Opportunities
None identified.

## 10. User Acceptance Criteria

```gherkin
Feature: Get product standard cost
  Scenario: Retrieve a valid product standard cost
    Given I have a valid ProductID and OrderDate
    When I execute the ufnGetProductStandardCost function with those parameters
    Then I should get the correct standard cost for that product on that date

  Scenario: Retrieve a product standard cost with an invalid ProductID
    Given I have an invalid ProductID and a valid OrderDate
    When I execute the ufnGetProductStandardCost function with those parameters
    Then I should get null or an error message
```
