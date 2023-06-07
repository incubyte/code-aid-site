---
title: "dbo.uspGetBillOfMaterials"
linkTitle: "dbo.uspGetBillOfMaterials"
description: "dbo.uspGetBillOfMaterials"
---

# Stored Procedures

## [dbo].[uspGetBillOfMaterials]
### Summary


- **Number of Tables Accessed:** 2
- **Lines of Code:** 37
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

CREATE PROCEDURE [dbo].[uspGetBillOfMaterials]
    @StartProductID [int],
    @CheckDate [datetime]
AS
BEGIN
    SET NOCOUNT ON;

    -- Use recursive query to generate a multi-level Bill of Material (i.e. all level 1 
    -- components of a level 0 assembly, all level 2 components of a level 1 assembly)
    -- The CheckDate eliminates any components that are no longer used in the product on this date.
    WITH [BOM_cte]([ProductAssemblyID], [ComponentID], [ComponentDesc], [PerAssemblyQty], [StandardCost], [ListPrice], [BOMLevel], [RecursionLevel]) -- CTE name and columns
    AS (
        SELECT b.[ProductAssemblyID], b.[ComponentID], p.[Name], b.[PerAssemblyQty], p.[StandardCost], p.[ListPrice], b.[BOMLevel], 0 -- Get the initial list of components for the bike assembly
        FROM [Production].[BillOfMaterials] b
            INNER JOIN [Production].[Product] p 
            ON b.[ComponentID] = p.[ProductID] 
        WHERE b.[ProductAssemblyID] = @StartProductID 
            AND @CheckDate >= b.[StartDate] 
            AND @CheckDate <= ISNULL(b.[EndDate], @CheckDate)
        UNION ALL
        SELECT b.[ProductAssemblyID], b.[ComponentID], p.[Name], b.[PerAssemblyQty], p.[StandardCost], p.[ListPrice], b.[BOMLevel], [RecursionLevel] + 1 -- Join recursive member to anchor
        FROM [BOM_cte] cte
            INNER JOIN [Production].[BillOfMaterials] b 
            ON b.[ProductAssemblyID] = cte.[ComponentID]
            INNER JOIN [Production].[Product] p 
            ON b.[ComponentID] = p.[ProductID] 
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
The `uspGetBillOfMaterials` stored procedure is used to retrieve a multi-level Bill of Materials (BOM) for a specified `ProductAssemblyID` and `CheckDate`. It returns a list of components required to assemble the product including their quantities, and other relevant details.

## Details
1. Input parameters:
   - `@StartProductID`: Specifies the starting product assembly ID.
   - `@CheckDate`: Specifies the date to check for valid component usage.

2. The procedure utilizes a Common Table Expression (CTE) called `BOM_cte`, which is a recursive query to retrieve all levels of components required for the specified assembly. The `BOM_cte` columns include `ProductAssemblyID`, `ComponentID`, `ComponentDesc`, `PerAssemblyQty`, `StandardCost`, `ListPrice`, `BOMLevel`, and `RecursionLevel`.

3. The final result includes the components, their quantities, costs, and other information, grouped by `ComponentID`, `ComponentDesc`, `ProductAssemblyID`, `BOMLevel`, `RecursionLevel`, `StandardCost`, and `ListPrice`. The results are ordered by `BOMLevel`, `ProductAssemblyID`, and `ComponentID`.

## Information on Data
- The procedure uses data from the `Production.BillOfMaterials` and `Production.Product` tables.

## Information on the Tables
1. `Production.BillOfMaterials`:
   - Contains information on the product assembly hierarchy and component relationships.
   - Columns involved in this procedure:
      - `ProductAssemblyID`
      - `ComponentID`
      - `PerAssemblyQty`
      - `StandardCost`
      - `ListPrice`
      - `BOMLevel`
      - `StartDate`
      - `EndDate`

2. `Production.Product`:
   - Contains information on products, including their names, costs, and other details.
   - Columns involved in this procedure:
      - `ProductID`
      - `Name`
      - `StandardCost`
      - `ListPrice`

## Possible Optimization Opportunities
- n/a

## Possible Bugs
- n/a

## Risk
- Running the query without a WHERE clause is not possible since the input parameters are used in the query.

## Code Complexity
- The code uses a recursive CTE that adds complexity to the procedure. However, the logic is well-documented, and there is an `OPTION (MAXRECURSION 25)` statement to limit the recursion depth.

## Refactoring Opportunities
- n/a

## User Acceptance Criteria
```
Scenario: Retrieve a Bill Of Material for a specific product assembly and check date
    Given a valid @StartProductID and @CheckDate
    When the uspGetBillOfMaterials stored procedure is executed
    Then it should return a list of components, their quantities, and other information for the specified product assembly and check date
```

```
Scenario: Handle invalid product assembly or check date
    Given an invalid @StartProductID or overlimit value for @CheckDate
    When the uspGetBillOfMaterials stored procedure is executed
    Then it should return an empty result set
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstselect |  | NA | NA |  |  |  |  |  |  |
| sstselect | [PRODUCTION].[BILLOFMATERIALS].[ComponentID], [PRODUCTION].[BILLOFMATERIALS].[BOMLevel], [PRODUCTION].[PRODUCT].[Name], [PRODUCTION].[BILLOFMATERIALS].[ProductAssemblyID], [PRODUCTION].[PRODUCT].[StandardCost], [PRODUCTION].[PRODUCT].[ListPrice], [PRODUCTION].[BILLOFMATERIALS].[PerAssemblyQty] | NA | NA |  |  |  |  |  |  |
| sstselect | [PRODUCTION].[BILLOFMATERIALS].[ComponentID], [PRODUCTION].[BILLOFMATERIALS].[BOMLevel], [PRODUCTION].[PRODUCT].[Name], [PRODUCTION].[BILLOFMATERIALS].[ProductAssemblyID], [PRODUCTION].[PRODUCT].[StandardCost], [PRODUCTION].[PRODUCT].[ListPrice], [PRODUCTION].[BILLOFMATERIALS].[PerAssemblyQty] | NA | NA | [PRODUCTION].[BILLOFMATERIALS].[ComponentID], [PRODUCTION].[PRODUCT].[ProductID] | [PRODUCTION].[BILLOFMATERIALS].[StartDate], [PRODUCTION].[BILLOFMATERIALS].[ProductAssemblyID], [PRODUCTION].[BILLOFMATERIALS].[EndDate] |  |  |  | [Production].[BillOfMaterials], [Production].[Product] |
| sstselect | [PRODUCTION].[BILLOFMATERIALS].[ComponentID], [PRODUCTION].[BILLOFMATERIALS].[BOMLevel], [PRODUCTION].[PRODUCT].[Name], [PRODUCTION].[BILLOFMATERIALS].[ProductAssemblyID], [PRODUCTION].[PRODUCT].[StandardCost], [PRODUCTION].[PRODUCT].[ListPrice], [PRODUCTION].[BILLOFMATERIALS].[PerAssemblyQty] | NA | NA | [PRODUCTION].[BILLOFMATERIALS].[ComponentID], [PRODUCTION].[PRODUCT].[ProductID], [PRODUCTION].[BILLOFMATERIALS].[ProductAssemblyID] | [PRODUCTION].[BILLOFMATERIALS].[StartDate], [PRODUCTION].[BILLOFMATERIALS].[EndDate] |  |  |  | [Production].[BillOfMaterials], [Production].[Product] |

