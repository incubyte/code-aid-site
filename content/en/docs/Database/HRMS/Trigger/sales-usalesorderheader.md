---
title: "Sales.uSalesOrderHeader"
linkTitle: "Sales.uSalesOrderHeader"
description: "Sales.uSalesOrderHeader"
---

# Triggers

## [Sales].[uSalesOrderHeader]
### Summary


- **Number of Tables Accessed:** 4
- **Lines of Code:** 69
- **Code Complexity:** 4
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [SALES].[SALESORDERHEADER]| [TerritoryID] | sstselect | WHERE |
| [SALES].[SALESORDERHEADER]| [Status] | sstselect | WHERE |


### Trigger Details

- **Trigger Type**: AFTER
- **Trigger Table**: [Sales].[SalesOrderHeader]
- **Trigger Events**: [UPDATE]

{{< details "Sql Code" >}}
```sql

CREATE TRIGGER [Sales].[uSalesOrderHeader] ON [Sales].[SalesOrderHeader] 
AFTER UPDATE NOT FOR REPLICATION AS 
BEGIN
    DECLARE @Count int;

    SET @Count = @@ROWCOUNT;
    IF @Count = 0 
        RETURN;

    SET NOCOUNT ON;

    BEGIN TRY
        -- Update RevisionNumber for modification of any field EXCEPT the Status.
        IF NOT UPDATE([Status])
        BEGIN
            UPDATE [Sales].[SalesOrderHeader]
            SET [Sales].[SalesOrderHeader].[RevisionNumber] = 
                [Sales].[SalesOrderHeader].[RevisionNumber] + 1
            WHERE [Sales].[SalesOrderHeader].[SalesOrderID] IN 
                (SELECT inserted.[SalesOrderID] FROM inserted);
        END;

        -- Update the SalesPerson SalesYTD when SubTotal is updated
        IF UPDATE([SubTotal])
        BEGIN
            DECLARE @StartDate datetime,
                    @EndDate datetime

            SET @StartDate = [dbo].[ufnGetAccountingStartDate]();
            SET @EndDate = [dbo].[ufnGetAccountingEndDate]();

            UPDATE [Sales].[SalesPerson]
            SET [Sales].[SalesPerson].[SalesYTD] = 
                (SELECT SUM([Sales].[SalesOrderHeader].[SubTotal])
                FROM [Sales].[SalesOrderHeader] 
                WHERE [Sales].[SalesPerson].[BusinessEntityID] = [Sales].[SalesOrderHeader].[SalesPersonID]
                    AND ([Sales].[SalesOrderHeader].[Status] = 5) -- Shipped
                    AND [Sales].[SalesOrderHeader].[OrderDate] BETWEEN @StartDate AND @EndDate)
            WHERE [Sales].[SalesPerson].[BusinessEntityID] 
                IN (SELECT DISTINCT inserted.[SalesPersonID] FROM inserted 
                    WHERE inserted.[OrderDate] BETWEEN @StartDate AND @EndDate);

            -- Update the SalesTerritory SalesYTD when SubTotal is updated
            UPDATE [Sales].[SalesTerritory]
            SET [Sales].[SalesTerritory].[SalesYTD] = 
                (SELECT SUM([Sales].[SalesOrderHeader].[SubTotal])
                FROM [Sales].[SalesOrderHeader] 
                WHERE [Sales].[SalesTerritory].[TerritoryID] = [Sales].[SalesOrderHeader].[TerritoryID]
                    AND ([Sales].[SalesOrderHeader].[Status] = 5) -- Shipped
                    AND [Sales].[SalesOrderHeader].[OrderDate] BETWEEN @StartDate AND @EndDate)
            WHERE [Sales].[SalesTerritory].[TerritoryID] 
                IN (SELECT DISTINCT inserted.[TerritoryID] FROM inserted 
                    WHERE inserted.[OrderDate] BETWEEN @StartDate AND @EndDate);
        END;
    END TRY
    BEGIN CATCH
        EXECUTE [dbo].[uspPrintError];

        -- Rollback any active or uncommittable transactions before
        -- inserting information in the ErrorLog
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        EXECUTE [dbo].[uspLogError];
    END CATCH;
END;

```
{{< /details >}}
## Overview
This is a documentation of the `Sales.uSalesOrderHeader` trigger in the `Sales` schema. The trigger is an `AFTER UPDATE` trigger that performs various updates on related tables whenever there is an update to the `Sales.SalesOrderHeader` table.

## Details

### Information on Data
The trigger works with the following tables:
1. Sales.SalesOrderHeader
2. Sales.SalesPerson
3. Sales.SalesTerritory

### Information on the Tables
1. Sales.SalesOrderHeader: This table contains sales order header records.
2. Sales.SalesPerson: This table contains salesperson information.
3. Sales.SalesTerritory: This table contains sales territory information.

### Possible Optimization Opportunities
None detected.

### Possible Bugs
None detected.

### Risk
1. A potential risk is that the trigger might cause slower update performance due to the additional updates on related tables.

### Code Complexity
The trigger has a moderate level of complexity as it checks for the updated fields and executes the corresponding updates if necessary. It also uses TRY-CATCH blocks to handle and log errors.

### Refactoring Opportunities
1. The trigger could be refactored by moving some functionality into stored procedures or user-defined functions to simplify the trigger code itself. For example, updating the `SalesYTD` for `Sales.SalesPerson` and `Sales.SalesTerritories` can be externalized.

## User Acceptance Criteria

### Gherkin Scripts

```gherkin
Feature: Sales.uSalesOrderHeader Trigger
  The trigger should maintain data integrity by updating related records after any update of SalesOrderHeader.

  Scenario: Updating any field except Status
    Given there is an updated SalesOrderHeader record with an edited field other than Status
    When the AFTER UPDATE trigger is run
    Then it should increase the RevisionNumber of the associated SalesOrderHeader by 1

  Scenario: Updating SubTotal field
    Given there is an updated SalesOrderHeader record with an edited SubTotal field
    When the AFTER UPDATE trigger is run
    Then it should update SalesYTD for SalesPerson and SalesTerritory associated with the SalesOrderHeader based on the new SubTotal
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|

