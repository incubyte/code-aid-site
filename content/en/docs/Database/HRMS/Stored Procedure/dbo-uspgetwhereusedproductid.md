---
title: "dbo.uspGetWhereUsedProductID"
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
| sstselect | [ProductAssemblyID], [ComponentID], [Name], [PerAssemblyQty], [StandardCost], [ListPrice], [BOMLevel], 0 | NA | NA | [ProductAssemblyID], [ProductID] | , [StartDate], [EndDate], [ComponentID] | [Production].[BillOfMaterials], [Production].[Product] |
| sstselect | [ProductAssemblyID], [ComponentID], [Name], [PerAssemblyQty], [StandardCost], [ListPrice], [BOMLevel], [RecursionLevel] + 1 | NA | NA | [ProductAssemblyID], [ProductID], [ComponentID] | , [StartDate], [EndDate] | [BOM_cte], [Production].[BillOfMaterials], [Production].[Product] |

## Overview
This stored procedure, `[dbo].[uspGetWhereUsedProductID]`, provides information about the components used in a product assembly. It uses a recursive query to generate a multi-level Bill of Materials (BOM) and returns details about each component with their level, quantity, cost, and price.

## Details

### Input Parameters
1. `@StartProductID`: The starting product ID for the Bill of Materials.
2. `@CheckDate`: The date used to check if a component is active within a product assembly.

### Output Columns
1. `ProductAssemblyID`: The ID of the parent product assembly.
2. `ComponentID`: The ID of the component.
3. `ComponentDesc`: The description/name of the component.
4. `TotalQuantity`: The total quantity of the component used in the product assembly.
5. `StandardCost`: The standard cost of the component.
6. `ListPrice`: The list price of the component.
7. `BOMLevel`: The level of the component in the product assembly.
8. `RecursionLevel`: The recursion level of the current query result.

## Information on data

The stored procedure uses data from the `Production.BillOfMaterials` and `Production.Product` tables.

## Information on the tables

1. `Production.BillOfMaterials`: Contains information on the components and assemblies that make up a product.
2. `Production.Product`: Contains information on the products and their pricing.

## Possible optimization opportunities
There are no immediate optimization opportunities for this stored procedure.

## Possible bugs
This stored procedure seems to have no apparent bugs or issues.

## Risk
There are no major risks associated with this stored procedure.

## Code Complexity
The code complexity is average due to the use of recursive CTE and the use of multiple `JOIN` operations.

## Refactoring Opportunities
There are no immediate refactoring opportunities for this stored procedure.

## User Acceptance Criteria

```gherkin
Feature: Bill of Materials
  Scenario: Get multi-level Bill of Materials
    Given a valid StartProductID is provided
    And a valid CheckDate is provided
    When the stored procedure uspGetWhereUsedProductID is executed
    Then it returns a multi-level Bill of Materials (BOM) with details about each component

  Scenario: Get results for an active component
    Given a valid StartProductID is provided
    And a CheckDate within the active period of the component is provided
    When the stored procedure uspGetWhereUsedProductID is executed
    Then it returns a BOM including the active component

  Scenario: Get results without inactive components
    Given a valid StartProductID is provided
    And a CheckDate outside the active period of a component is provided
    When the stored procedure uspGetWhereUsedProductID is executed
    Then it does not return any BOM containing the inactive component
```
