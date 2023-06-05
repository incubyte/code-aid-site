---
title: "Production.iWorkOrder"
linkTitle: "Production.iWorkOrder"
description: "Production.iWorkOrder"
---

# Triggers

## [Production].[iWorkOrder]
### Summary


- **Number of Tables Accessed:** 2
- **Lines of Code:** 42
- **Code Complexity:** 3
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Trigger Details

- **Trigger Type**: AFTER
- **Trigger Table**: [Production].[WorkOrder]
- **Trigger Events**: [INSERT]

{{< details "Sql Code" >}}
```sql

CREATE TRIGGER [Production].[iWorkOrder] ON [Production].[WorkOrder] 
AFTER INSERT AS 
BEGIN
    DECLARE @Count int;

    SET @Count = @@ROWCOUNT;
    IF @Count = 0 
        RETURN;

    SET NOCOUNT ON;

    BEGIN TRY
        INSERT INTO [Production].[TransactionHistory](
            [ProductID]
            ,[ReferenceOrderID]
            ,[TransactionType]
            ,[TransactionDate]
            ,[Quantity]
            ,[ActualCost])
        SELECT 
            inserted.[ProductID]
            ,inserted.[WorkOrderID]
            ,'W'
            ,GETDATE()
            ,inserted.[OrderQty]
            ,0
        FROM inserted;
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
## 1. Overview
The script above creates a trigger named `iWorkOrder` in the `Production` schema on the `WorkOrder` table. The trigger gets invoked after an `INSERT` operation on the `WorkOrder` table, and its main goal is to insert a new record into the `TransactionHistory` table with relevant information from the newly inserted `WorkOrder` record.

## 2. Details
The trigger consists of the following steps:

1. Declare an integer variable `@Count` to store the number of rows affected by the `INSERT` operation.
2. Check if the number of affected rows is equal to 0; if true, exit the trigger.
3. Set `NOCOUNT` to `ON` to avoid sending row count information to the client.
4. Use a `TRY-CATCH` block to handle possible errors:
    - In the `TRY` block, insert a new record into the `TransactionHistory` using the data from the `inserted` table.
    - In the `CATCH` block, print the error and rollback any active transactions. Then log the error using the `uspLogError` stored procedure.

## 3. Information on data
- `@@ROWCOUNT`: Returns the number of rows affected by the last statement.
- `inserted`: A virtual table that holds the new rows being inserted into `WorkOrder`.

## 4. Information on the tables
- `Production.WorkOrder`: A table containing the work orders for the production process.
- `Production.TransactionHistory`: A table storing transaction history records.

## 5. Possible optimization opportunities
- None identified at the moment.

## 6. Possible bugs
- None identified at the moment.

## 7. Risk
- No `WHERE` clause used in the script, but it is intended as it is a trigger and should execute for the entire result of the `INSERT` statement.

## 8. Code Complexity
- The code is straightforward and easy to understand.

## 9. Refactoring Opportunities
- None identified at the moment.

## 10. User Acceptance Criteria
```gherkin
Feature: iWorkOrder Trigger
  As a user
  I want to insert new records into the WorkOrder table
  And have a new record with corresponding values in the TransactionHistory table

  Scenario: Insert a record into the WorkOrder table
    Given I have a new WorkOrder record
    When I insert the record into the WorkOrder table
    Then a new record should be inserted into the TransactionHistory table
    And the data in the TransactionHistory record should match the inserted WorkOrder record
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqldeclare |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstinsert | NA | NA | [ProductID], [ReferenceOrderID], [TransactionType], [TransactionDate], [Quantity], [ActualCost] | NA | NA |  |  |  | [Production].[TransactionHistory] |
| sstselect | [PRODUCTION].[WORKORDER].[ProductID], [PRODUCTION].[WORKORDER].[WorkOrderID], [PRODUCTION].[WORKORDER].[OrderQty] | NA | NA |  |  |  |  |  | inserted |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlrollback |  |  |  |  |  |  |  |  |  |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |

