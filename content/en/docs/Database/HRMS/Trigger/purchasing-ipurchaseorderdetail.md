---
title: "Purchasing.iPurchaseOrderDetail"
linkTitle: "Purchasing.iPurchaseOrderDetail"
description: "Purchasing.iPurchaseOrderDetail"
---

# Triggers

## [Purchasing].[iPurchaseOrderDetail]
### Summary


- **Number of Tables Accessed:** 4
- **Lines of Code:** 55
- **Code Complexity:** 3
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| | [PurchaseOrderID] | sstselect | JOIN |


### Trigger Details

- **Trigger Type**: AFTER
- **Trigger Table**: [Purchasing].[PurchaseOrderDetail]
- **Trigger Events**: [INSERT]

{{< details "Sql Code" >}}
```sql

CREATE TRIGGER [Purchasing].[iPurchaseOrderDetail] ON [Purchasing].[PurchaseOrderDetail] 
AFTER INSERT AS
BEGIN
    DECLARE @Count int;

    SET @Count = @@ROWCOUNT;
    IF @Count = 0 
        RETURN;

    SET NOCOUNT ON;

    BEGIN TRY
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
            INNER JOIN [Purchasing].[PurchaseOrderHeader] 
            ON inserted.[PurchaseOrderID] = [Purchasing].[PurchaseOrderHeader].[PurchaseOrderID];

        -- Update SubTotal in PurchaseOrderHeader record. Note that this causes the 
        -- PurchaseOrderHeader trigger to fire which will update the RevisionNumber.
        UPDATE [Purchasing].[PurchaseOrderHeader]
        SET [Purchasing].[PurchaseOrderHeader].[SubTotal] = 
            (SELECT SUM([Purchasing].[PurchaseOrderDetail].[LineTotal])
                FROM [Purchasing].[PurchaseOrderDetail]
                WHERE [Purchasing].[PurchaseOrderHeader].[PurchaseOrderID] = [Purchasing].[PurchaseOrderDetail].[PurchaseOrderID])
        WHERE [Purchasing].[PurchaseOrderHeader].[PurchaseOrderID] IN (SELECT inserted.[PurchaseOrderID] FROM inserted);
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
This is a documentation for the trigger `iPurchaseOrderDetail` on the `Purchasing.PurchaseOrderDetail` table. The trigger is an AFTER INSERT trigger which updates the `Production.TransactionHistory` table and the `Purchasing.PurchaseOrderHeader` table when a new record is inserted into the `Purchasing.PurchaseOrderDetail` table.

## Details

### Information on Data
The trigger operates on the following tables:

1. **Purchasing.PurchaseOrderDetail**: This table stores detailed information about each purchase order line item.
2. **Purchasing.PurchaseOrderHeader**: It contains the header information about the purchase orders.
3. **Production.TransactionHistory**: This table stores transaction history information for each product.

### Information on the Tables
1. **Purchasing.PurchaseOrderDetail**:
  - PurchaseOrderID
  - ProductID
  - OrderQty
  - UnitPrice
  - StockedQty

2. **Purchasing.PurchaseOrderHeader**:
  - PurchaseOrderID
  - SubTotal

3. **Production.TransactionHistory**:
    - TransactionID
    - ProductID
    - ReferenceOrderID
    - ReferenceOrderLineID
    - TransactionType
    - TransactionDate
    - Quantity
    - ActualCost

### Possible Optimization Opportunities
No obvious optimization opportunities were identified in the trigger.

### Possible Bugs
No obvious bugs were identified in the trigger.

### Risk
- The trigger updates the `Production.TransactionHistory` table and the `Purchasing.PurchaseOrderHeader` table without any WHERE clause, which might lead to performance issues in case of a large number of rows being affected by the update operation.

### Code Complexity
The code complexity is relatively low, with the main logic consisting of an INSERT operation and an UPDATE operation.

### Refactoring Opportunities
- Consider adding a WHERE clause to minimize the risk of affecting a large number of rows.

## User Acceptance Criteria
```gherkin
Feature: Purchase Order Detail Insertion
  As a database user
  I want the trigger iPurchaseOrderDetail to execute successfully
  When a new record is inserted into the Purchasing.PurchaseOrderDetail table

Scenario: New Purchase Order Detail is inserted
  Given a new record is inserted into Purchasing.PurchaseOrderDetail table
  When the iPurchaseOrderDetail trigger is fired
  Then the new transaction should be added to the Production.TransactionHistory table
  And the SubTotal of the corresponding PurchaseOrder should be updated in Purchasing.PurchaseOrderHeader table
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqldeclare |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstinsert | NA | NA | [ProductID], [ReferenceOrderID], [ReferenceOrderLineID], [TransactionType], [TransactionDate], [Quantity], [ActualCost] | NA | NA |  |  |  | [Production].[TransactionHistory] |
| sstselect | [ProductID], [PurchaseOrderDetailID], [PurchaseOrderID], [UnitPrice], [OrderQty] | NA | NA | [PURCHASING].[PURCHASEORDERHEADER].[PurchaseOrderID], [PurchaseOrderID] |  |  |  |  | [Purchasing].[PurchaseOrderHeader], inserted |
| sstupdate | NA | [Purchasing].[PurchaseOrderHeader].[SubTotal] | NA |  | [PURCHASING].[PURCHASEORDERHEADER].[PurchaseOrderID] |  |  |  | [Purchasing].[PurchaseOrderHeader] |
| sstselect | [PURCHASING].[PURCHASEORDERDETAIL].[LineTotal] | NA | NA |  | [PURCHASING].[PURCHASEORDERHEADER].[PurchaseOrderID], [PURCHASING].[PURCHASEORDERDETAIL].[PurchaseOrderID] |  |  |  | [Purchasing].[PurchaseOrderDetail] |
| sstselect | [PURCHASING].[PURCHASEORDERHEADER].[PurchaseOrderID] | NA | NA |  |  |  |  |  | inserted |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlrollback |  |  |  |  |  |  |  |  |  |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |

