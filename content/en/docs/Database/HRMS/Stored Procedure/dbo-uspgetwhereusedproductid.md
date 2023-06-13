---
title: "dbo.uspGetWhereUsedProductID"
linkTitle: "dbo.uspGetWhereUsedProductID"
description: "dbo.uspGetWhereUsedProductID"
---

# Stored Procedures

## [dbo].[uspGetWhereUsedProductID]
### Summary


- **Number of Tables Accessed:** 2
- **Lines of Code:** 35
- **Code Complexity:** 4
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [PRODUCTION].[BILLOFMATERIALS]| [EndDate] | sstselect | WHERE |


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @StartProductID | INT | IN |
| @CheckDate | DATETIME | IN |

{{< details "Sql Code" >}}
```sql

CREATE PROCEDURE [dbo].[uspGetWhereUsedProductID]
    @StartProductID [int],
    @CheckDate [datetime]
AS
BEGIN
    SET NOCOUNT ON;

    --Use recursive query to generate a multi-level Bill of Material (i.e. all level 1 components of a level 0 assembly, all level 2 components of a level 1 assembly)
    WITH [BOM_cte]([ProductAssemblyID], [ComponentID], [ComponentDesc], [PerAssemblyQty], [StandardCost], [ListPrice], [BOMLevel], [RecursionLevel]) -- CTE name and columns
    AS (
        SELECT b.[ProductAssemblyID], b.[ComponentID], p.[Name], b.[PerAssemblyQty], p.[StandardCost], p.[ListPrice], b.[BOMLevel], 0 -- Get the initial list of components for the bike assembly
        FROM [Production].[BillOfMaterials] b
            INNER JOIN [Production].[Product] p 
            ON b.[ProductAssemblyID] = p.[ProductID] 
        WHERE b.[ComponentID] = @StartProductID 
            AND @CheckDate >= b.[StartDate] 
            AND @CheckDate <= ISNULL(b.[EndDate], @CheckDate)
        UNION ALL
        SELECT b.[ProductAssemblyID], b.[ComponentID], p.[Name], b.[PerAssemblyQty], p.[StandardCost], p.[ListPrice], b.[BOMLevel], [RecursionLevel] + 1 -- Join recursive member to anchor
        FROM [BOM_cte] cte
            INNER JOIN [Production].[BillOfMaterials] b 
            ON cte.[ProductAssemblyID] = b.[ComponentID]
            INNER JOIN [Production].[Product] p 
            ON b.[ProductAssemblyID] = p.[ProductID] 
        WHERE @CheckDate >= b.[StartDate] 
            AND @CheckDate <= ISNULL(b.[EndDate], @CheckDate)
        )
    -- Outer select from the CTE
    SELECT b.[ProductAssemblyID], b.[ComponentID], b.[ComponentDesc], SUM(b.[PerAssemblyQty]) AS [TotalQuantity] , b.[StandardCost], b.[ListPrice], b.[BOMLevel], b.[RecursionLevel]
    FROM [BOM_cte] b
    GROUP BY b.[ComponentID], b.[ComponentDesc], b.[ProductAssemblyID], b.[BOMLevel], b.[RecursionLevel], b.[StandardCost], b.[ListPrice]
    ORDER BY b.[BOMLevel], b.[ProductAssemblyID], b.[ComponentID]
    OPTION (MAXRECURSION 25) 
END;

```
{{< /details >}}
## Overview
This stored procedure, `uspGetWhereUsedProductID`, is designed to retrieve a multi-level Bill of Materials (BOM) for a specific product. It uses a recursive common table expression (CTE) to traverse the BOM hierarchy and gather information about each component in the assembly.

## Details

### Parameters
- `@StartProductID`: The starting Product ID for which the BOM is being generated.
- `@CheckDate`: The date used to filter the relevant BOM by the start and end dates.

### CTE Structure
The recursive query consists of two parts:

1. **Anchor Member**: This query fetches the initial list of components for the specified product assembly.
2. **Recursive Member**: This query traverses the BOM hierarchy, joining each product's assembly to its components.

The two parts are combined using a `UNION ALL` operator.

## Information on data

The stored procedure queries data from two tables in the `Production` schema:

1. `BillOfMaterials`: Stores the relationship between each product assembly and its components, including the quantity of each component required and the start and end dates.
2. `Product`: Contains details about each product, such as the name, standard cost, and list price.

## Information on the tables

The stored procedure joins the `BillOfMaterials` table to the `Product` table twice:

1. In the anchor member, the join is performed on the `ProductAssemblyID` column to retrieve the product details.
2. In the recursive member, the join is performed on the `ComponentID` column to continuously traverse the hierarchy.

## Possible optimization opportunities

- Adding appropriate indexes on the `ProductAssemblyID` and `ComponentID` columns in the `BillOfMaterials` table might improve the performance of the stored procedure.

## Possible bugs

- The stored procedure currently handles up to 25 levels of recursion. If there is a deeper BOM hierarchy, the query will fail to return all relevant data. This limitation can be adjusted using the `OPTION (MAXRECURSION n)` query hint, where `n` is the maximum number of recursion levels.

## Risk

1. Running the stored procedure without a `WHERE` clause may cause performance issues if the `BillOfMaterials` or `Product` tables have a large number of rows.

## Code Complexity

The stored procedure is of moderate complexity due to the use of a recursive CTE to traverse the BOM hierarchy. Understanding and maintaining the code might require some knowledge of hierarchical data and CTEs.

## Refactoring Opportunities

- Splitting the stored procedure into smaller user-defined functions or stored procedures might improve the readability and maintainability of the code.

## User Acceptance Criteria

```gherkin
Feature: uspGetWhereUsedProductID
  Retrieve the multi-level Bill of Materials (BOM) for a specific product.

Scenario: Retrieve BOM for a specific product ID and check date
  Given a valid StartProductID and CheckDate
  When the stored procedure is executed
  Then the stored procedure should return the multi-level BOM for the specified product
```

### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT |  | NA | NA |  |  |  |  |  |  |
| SELECT | [PRODUCTION].[BILLOFMATERIALS].[ComponentID], [PRODUCTION].[BILLOFMATERIALS].[BOMLevel], [PRODUCTION].[PRODUCT].[Name], [PRODUCTION].[BILLOFMATERIALS].[ProductAssemblyID], [PRODUCTION].[PRODUCT].[StandardCost], [PRODUCTION].[PRODUCT].[ListPrice], [PRODUCTION].[BILLOFMATERIALS].[PerAssemblyQty] | NA | NA |  |  |  |  |  |  |
| SELECT | [PRODUCTION].[BILLOFMATERIALS].[ComponentID], [PRODUCTION].[BILLOFMATERIALS].[BOMLevel], [PRODUCTION].[PRODUCT].[Name], [PRODUCTION].[BILLOFMATERIALS].[ProductAssemblyID], [PRODUCTION].[PRODUCT].[StandardCost], [PRODUCTION].[PRODUCT].[ListPrice], [PRODUCTION].[BILLOFMATERIALS].[PerAssemblyQty] | NA | NA | [PRODUCTION].[PRODUCT].[ProductID], [PRODUCTION].[BILLOFMATERIALS].[ProductAssemblyID] | [PRODUCTION].[BILLOFMATERIALS].[ComponentID], [PRODUCTION].[BILLOFMATERIALS].[StartDate], [PRODUCTION].[BILLOFMATERIALS].[EndDate] |  |  |  | [Production].[BillOfMaterials], [Production].[Product] |
| SELECT | [PRODUCTION].[BILLOFMATERIALS].[ComponentID], [PRODUCTION].[BILLOFMATERIALS].[BOMLevel], [PRODUCTION].[PRODUCT].[Name], [PRODUCTION].[BILLOFMATERIALS].[ProductAssemblyID], [PRODUCTION].[PRODUCT].[StandardCost], [PRODUCTION].[PRODUCT].[ListPrice], [PRODUCTION].[BILLOFMATERIALS].[PerAssemblyQty] | NA | NA | [PRODUCTION].[BILLOFMATERIALS].[ComponentID], [PRODUCTION].[PRODUCT].[ProductID], [PRODUCTION].[BILLOFMATERIALS].[ProductAssemblyID] | [PRODUCTION].[BILLOFMATERIALS].[StartDate], [PRODUCTION].[BILLOFMATERIALS].[EndDate] |  |  |  | [Production].[BillOfMaterials], [Production].[Product] |

