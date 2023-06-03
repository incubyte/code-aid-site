---
title: "Purchasing.uPurchaseOrderDetail"
linkTitle: "Purchasing.uPurchaseOrderDetail"
description: "Purchasing.uPurchaseOrderDetail"
---

# Triggers

## [Purchasing].[uPurchaseOrderDetail]
### Summary


- **Number of Tables Accessed:** 4
- **Lines of Code:** 67
- **Code Complexity:** 4
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| | [PurchaseOrderID] | sstselect | JOIN |


### Trigger Details

- **Trigger Type**: AFTER
- **Trigger Table**: [Purchasing].[PurchaseOrderDetail]
- **Trigger Events**: [UPDATE]

{{< details "Sql Code" >}}
```sql

CREATE TRIGGER [Purchasing].[uPurchaseOrderDetail] ON [Purchasing].[PurchaseOrderDetail] 
AFTER UPDATE AS 
BEGIN
    DECLARE @Count int;

    SET @Count = @@ROWCOUNT;
    IF @Count = 0 
        RETURN;

    SET NOCOUNT ON;

    BEGIN TRY
        IF UPDATE([ProductID]) OR UPDATE([OrderQty]) OR UPDATE([UnitPrice])
        -- Insert record into TransactionHistory 
        BEGIN
            INSERT INTO [Production].[TransactionHistory]
                ([ProductID]
                ,[ReferenceOrderID]
                ,[ReferenceOrderLineID]
                ,[TransactionType]
                ,[TransactionDate]
                ,[Quantity]
                ,[ActualCost])
            SELECT 
                inserted.[ProductID]
                ,inserted.[PurchaseOrderID]
                ,inserted.[PurchaseOrderDetailID]
                ,'P'
                ,GETDATE()
                ,inserted.[OrderQty]
                ,inserted.[UnitPrice]
            FROM inserted 
                INNER JOIN [Purchasing].[PurchaseOrderDetail] 
                ON inserted.[PurchaseOrderID] = [Purchasing].[PurchaseOrderDetail].[PurchaseOrderID];

            -- Update SubTotal in PurchaseOrderHeader record. Note that this causes the 
            -- PurchaseOrderHeader trigger to fire which will update the RevisionNumber.
            UPDATE [Purchasing].[PurchaseOrderHeader]
            SET [Purchasing].[PurchaseOrderHeader].[SubTotal] = 
                (SELECT SUM([Purchasing].[PurchaseOrderDetail].[LineTotal])
                    FROM [Purchasing].[PurchaseOrderDetail]
                    WHERE [Purchasing].[PurchaseOrderHeader].[PurchaseOrderID] 
                        = [Purchasing].[PurchaseOrderDetail].[PurchaseOrderID])
            WHERE [Purchasing].[PurchaseOrderHeader].[PurchaseOrderID] 
                IN (SELECT inserted.[PurchaseOrderID] FROM inserted);

            UPDATE [Purchasing].[PurchaseOrderDetail]
            SET [Purchasing].[PurchaseOrderDetail].[ModifiedDate] = GETDATE()
            FROM inserted
            WHERE inserted.[PurchaseOrderID] = [Purchasing].[PurchaseOrderDetail].[PurchaseOrderID]
                AND inserted.[PurchaseOrderDetailID] = [Purchasing].[PurchaseOrderDetail].[PurchaseOrderDetailID];
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

This trigger, named `uPurchaseOrderDetail`, is created on the `Purchasing.PurchaseOrderDetail` table and is triggered after an update takes place. It is meant to perform several actions related to updating transaction history and purchase order headers.

## Details

1. The trigger starts by checking if any rows are affected by the update (`@@ROWCOUNT`). If none, it immediately returns and does nothing further.
2. It disables the count feature using `SET NOCOUNT ON;`
3. The main part of the trigger is started by a try-catch block to handle errors gracefully.

## Information on Data

Affected tables in this trigger are:

- Purchasing.PurchaseOrderDetail
- Production.TransactionHistory
- Purchasing.PurchaseOrderHeader

## Information on the Tables

### Purchasing.PurchaseOrderDetail

This table contains information about each product in a purchase order. Some important columns included in the trigger are:

- ProductID
- OrderQty
- UnitPrice

### Production.TransactionHistory

This table contains information about product transactions. Columns involved in the trigger are:

- ProductID
- ReferenceOrderID
- ReferenceOrderLineID
- TransactionType
- TransactionDate
- Quantity
- ActualCost

### Purchasing.PurchaseOrderHeader

This table contains information about purchase orders. Impacted columns in the trigger are:

- PurchaseOrderID
- SubTotal

## Possible Optimization Opportunities

- None at the moment

## Possible Bugs

- None reported so far

## Risk

- None specifically. However, since the trigger operates on `UPDATE` statement, there is a potential risk if any update query is executed without a `WHERE` clause. It will update all rows in the table and create unnecessary trigger runs.

## Code Complexity

- The trigger has a moderate code complexity involving multiple table updates.

## Refactoring Opportunities

- None at the moment.

## User Acceptance Criteria

Please find the Gherkin scripts below for each behavior of the code.

```Gherkin
Feature: Update Purchase Order Detail
  Scenario: Update PurchaseOrderDetail with valid data
    Given a valid row exists in PurchaseOrderDetail
    When an update is performed on the row in PurchaseOrderDetail
    Then the TransactionHistory should have the corresponding entry for the update
    And the PurchaseOrderHeader SubTotal should be updated accordingly
    And the PurchaseOrderDetail ModifiedDate should be updated as well

  Scenario: Update PurchaseOrderDetail with no affected rows
    Given no rows are affected by the update query
    When the trigger is executed
    Then the trigger should immediately return and not perform any further action
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
| sstinsert | NA | NA | [ProductID], [ReferenceOrderID], [ReferenceOrderLineID], [TransactionType], [TransactionDate], [Quantity], [ActualCost] | NA | NA |  |  |  | [Production].[TransactionHistory] |
| sstselect | [ProductID], [PurchaseOrderDetailID], [PurchaseOrderID], [UnitPrice], [OrderQty] | NA | NA | [PURCHASING].[PURCHASEORDERDETAIL].[PurchaseOrderID], [PurchaseOrderID] |  |  |  |  | inserted, [Purchasing].[PurchaseOrderDetail] |
| sstupdate | NA | [Purchasing].[PurchaseOrderHeader].[SubTotal] | NA |  | [PURCHASING].[PURCHASEORDERHEADER].[PurchaseOrderID] |  |  |  | [Purchasing].[PurchaseOrderHeader] |
| sstselect | [PURCHASING].[PURCHASEORDERDETAIL].[LineTotal] | NA | NA |  | [PURCHASING].[PURCHASEORDERHEADER].[PurchaseOrderID], [PURCHASING].[PURCHASEORDERDETAIL].[PurchaseOrderID] |  |  |  | [Purchasing].[PurchaseOrderDetail] |
| sstselect | [PURCHASING].[PURCHASEORDERHEADER].[PurchaseOrderID] | NA | NA |  |  |  |  |  | inserted |
| sstupdate | NA | [Purchasing].[PurchaseOrderDetail].[ModifiedDate] | NA |  | [PURCHASING].[PURCHASEORDERDETAIL].[PurchaseOrderDetailID], [PURCHASING].[PURCHASEORDERDETAIL].[PurchaseOrderID] |  |  |  | inserted, [Purchasing].[PurchaseOrderDetail] |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlrollback |  |  |  |  |  |  |  |  |  |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |

