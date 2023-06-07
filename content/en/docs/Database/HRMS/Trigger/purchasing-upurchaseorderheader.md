---
title: "Purchasing.uPurchaseOrderHeader"
linkTitle: "Purchasing.uPurchaseOrderHeader"
description: "Purchasing.uPurchaseOrderHeader"
---

# Triggers

## [Purchasing].[uPurchaseOrderHeader]
### Summary


- **Number of Tables Accessed:** 2
- **Lines of Code:** 36
- **Code Complexity:** 4
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Trigger Details

- **Trigger Type**: AFTER
- **Trigger Table**: [Purchasing].[PurchaseOrderHeader]
- **Trigger Events**: [UPDATE]

{{< details "Sql Code" >}}
```sql

CREATE TRIGGER [Purchasing].[uPurchaseOrderHeader] ON [Purchasing].[PurchaseOrderHeader] 
AFTER UPDATE AS 
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
            UPDATE [Purchasing].[PurchaseOrderHeader]
            SET [Purchasing].[PurchaseOrderHeader].[RevisionNumber] = 
                [Purchasing].[PurchaseOrderHeader].[RevisionNumber] + 1
            WHERE [Purchasing].[PurchaseOrderHeader].[PurchaseOrderID] IN 
                (SELECT inserted.[PurchaseOrderID] FROM inserted);
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
This markdown documentation provides information on the trigger `Purchasing.uPurchaseOrderHeader` applied to the table `Purchasing.PurchaseOrderHeader`. The trigger is executed after an update operation on the table. 

## Details
### 1. Trigger Execution
The trigger checks for the update of any field except the `Status` column in the `Purchasing.PurchaseOrderHeader` table.

### 2. Conditions
- If there are no affected rows in the update, the trigger will return without any further action.
- If any field other than `Status` is updated, the trigger updates the `RevisionNumber` by incrementing it by one.

### 3. Error Handling
If an error occurs during the trigger execution, the `dbo.uspPrintError` stored procedure is called to print the error information. The trigger then checks if there are any active or uncommitable transactions. If there are, it rolls back the transaction. Finally, it calls the `dbo.uspLogError` stored procedure to log the error information.

## Information on Data
The trigger uses data from the `Purchasing.PurchaseOrderHeader` table, specifically the `PurchaseOrderID`, `RevisionNumber`, and `Status` columns.

## Information on the Tables
The following table is involved in the trigger execution:

- `Purchasing.PurchaseOrderHeader`: Stores purchase order headers. The key columns are `PurchaseOrderID`, `RevisionNumber`, and `Status`.

## Possible Optimization Opportunities
Currently, no optimization opportunities have been identified for this trigger.

## Possible Bugs
There are no known bugs in the trigger.

## Risk
This trigger can cause issues if updates on the `Purchasing.PurchaseOrderHeader` table are slow. The update operation on the `RevisionNumber` column may lead to delays in the overall execution of updates on the table.

There are no risks concerning running a query without a WHERE clause.

## Code Complexity
The trigger uses simple logic and conditions, resulting in low code complexity.

## Refactoring Opportunities
Currently, no refactoring opportunities have been identified for this trigger.

## User Acceptance Criteria

```gherkin
Feature: uPurchaseOrderHeader Trigger
    The trigger should increment the RevisionNumber when any field except Status is updated in the PurchaseOrderHeader table.

    Scenario: Update any field other than Status
        Given a row in the PurchaseOrderHeader table
        When any field other than Status is updated
        Then the trigger should increment the RevisionNumber by 1

    Scenario: Update only Status field
        Given a row in the PurchaseOrderHeader table
        When only the Status field is updated
        Then the trigger should not increment the RevisionNumber
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqldeclare |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstupdate | NA | [Purchasing].[PurchaseOrderHeader].[RevisionNumber] | NA |  | [PURCHASING].[PURCHASEORDERHEADER].[PurchaseOrderID] |  |  |  | [Purchasing].[PurchaseOrderHeader] |
| sstselect | [PURCHASING].[PURCHASEORDERHEADER].[PurchaseOrderID] | NA | NA |  |  |  |  |  | inserted |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlrollback |  |  |  |  |  |  |  |  |  |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |

