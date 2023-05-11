---
title: "dbo.uspGetBillOfMaterials"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins | Where Clause | Table Name |
|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |
| sstselect | [ProductAssemblyID], [ComponentID], [ComponentDesc], SUM([PerAssemblyQty]), [StandardCost], [ListPrice], [BOMLevel], [RecursionLevel] | NA | NA |  |  | [BOM_cte] |
| sstselect | [ProductAssemblyID], [ComponentID], [Name], [PerAssemblyQty], [StandardCost], [ListPrice], [BOMLevel], [RecursionLevel] + 1 | NA | NA |  |  |  |
| sstselect | [ProductAssemblyID], [ComponentID], [Name], [PerAssemblyQty], [StandardCost], [ListPrice], [BOMLevel], 0 | NA | NA | [ProductID], [ComponentID] | [ProductAssemblyID], , [StartDate], [EndDate] | [Production].[BillOfMaterials], [Production].[Product] |
| sstselect | [ProductAssemblyID], [ComponentID], [Name], [PerAssemblyQty], [StandardCost], [ListPrice], [BOMLevel], [RecursionLevel] + 1 | NA | NA | [ProductAssemblyID], [ProductID], [ComponentID] | , [StartDate], [EndDate] | [BOM_cte], [Production].[BillOfMaterials], [Production].[Product] |

## Overview

This stored procedure, `uspGetBillOfMaterials`, is designed to retrieve a multi-level Bill of Materials (BOM) for a specific product assembly, based on a given `@StartProductID` and `@CheckDate`. The output includes information on components, quantity, costs, and BOM level.

## Details

The stored procedure uses a recursive common table expression (CTE) `BOM_cte` to generate the multi-level BOM, and then it selects the required information from the CTE.

### Input Parameters

1. `@StartProductID`: The starting product ID for which the BOM needs to be generated.
2. `@CheckDate`: The date used to eliminate any components that are no longer in use.

### Output Columns

1. `ProductAssemblyID`
2. `ComponentID`
3. `ComponentDesc`
4. `TotalQuantity`
5. `StandardCost`
6. `ListPrice`
7. `BOMLevel`
8. `RecursionLevel`

## Information on data

Data for this stored procedure is retrieved from the following tables:

1. `Production.BillOfMaterials`
2. `Production.Product`

## Information on the tables

### Production.BillOfMaterials

This table contains information about the components used to build a product, including start and end dates of use and the quantity needed for each assembly.

### Production.Product

This table contains product information, such as name, standard cost, and list price.

## Possible optimization opportunities

There are no obvious optimization opportunities in the current stored procedure. 

## Possible bugs

There are no known bugs in the code.

## Risk

As there are no `WHERE` clauses in the recursive query, this stored procedure may not have any risks associated with a missing `WHERE` clause.

## Code Complexity

The code uses recursive CTEs to generate a multi-level BOM, which may be considered complex. However, the structure of the code is clean and easy to read.

## Refactoring Opportunities

No refactoring opportunities have been identified, as the code is well-structured and relatively simple.

## User Acceptance Criteria

### Gherkin Scripts

```gherkin
Feature: Retrieve Multi-Level BOM
  The uspGetBillOfMaterials stored procedure retrieves a multi-level BOM for a specific product.

  Scenario: Retrieve BOM for a valid product assembly and check date
    Given a valid @StartProductID and @CheckDate
    When the uspGetBillOfMaterials stored procedure is executed
    Then a multi-level BOM with the required information should be returned

  Scenario: Retrieve BOM with an invalid @StartProductID
    Given an invalid @StartProductID
    When the uspGetBillOfMaterials stored procedure is executed
    Then an empty result set should be returned

  Scenario: Retrieve BOM with a @CheckDate that is out of range
    Given a @CheckDate that is out of range for the given @StartProductID
    When the uspGetBillOfMaterials stored procedure is executed
    Then an empty result set should be returned
```
