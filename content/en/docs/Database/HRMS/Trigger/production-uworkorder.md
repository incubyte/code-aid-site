---
title: "Production.uWorkOrder"
linkTitle: "Production.uWorkOrder"
description: "Production.uWorkOrder"
---

# Triggers

## [Production].[uWorkOrder]
### Summary


- **Number of Tables Accessed:** 2
- **Lines of Code:** 43
- **Code Complexity:** 4
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Trigger Details

- **Trigger Type**: AFTER
- **Trigger Table**: [Production].[WorkOrder]
- **Trigger Events**: [UPDATE]

{{< details "Sql Code" >}}
```sql

CREATE TRIGGER [Production].[uWorkOrder] ON [Production].[WorkOrder] 
AFTER UPDATE AS 
BEGIN
    DECLARE @Count int;

    SET @Count = @@ROWCOUNT;
    IF @Count = 0 
        RETURN;

    SET NOCOUNT ON;

    BEGIN TRY
        IF UPDATE([ProductID]) OR UPDATE([OrderQty])
        BEGIN
            INSERT INTO [Production].[TransactionHistory](
                [ProductID]
                ,[ReferenceOrderID]
                ,[TransactionType]
                ,[TransactionDate]
                ,[Quantity])
            SELECT 
                inserted.[ProductID]
                ,inserted.[WorkOrderID]
                ,'W'
                ,GETDATE()
                ,inserted.[OrderQty]
            FROM inserted;
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
This documentation is for a trigger called `Production.uWorkOrder` which is created on the `Production.WorkOrder` table. The trigger is executed after an UPDATE statement on the table. The trigger inserts a new row into the `Production.TransactionHistory` table, recording the changes made to the `ProductID` or `OrderQty` fields.

## Details

### Information on data
The trigger uses the following data:

1. `@@ROWCOUNT`: The number of rows affected by the last executed statement.
2. `inserted`: A virtual table holding the new versions of the updated rows.

### Information on the tables
It involves two tables:

1. `Production.WorkOrder`: This table contains work order information.
2. `Production.TransactionHistory`: This table contains transaction history records.

### Possible optimization opportunities
None

### Possible bugs
None

### Risk
- The trigger may cause performance issues if large updates are made to the `Production.WorkOrder` table.
- If any query runs without a WHERE clause, it will cause the trigger to execute on all rows, potentially causing performance issues or incorrect data in the `Production.TransactionHistory` table.

### Code Complexity
The code complexity is low, with a single INSERT statement being executed on specific conditions.

### Refactoring Opportunities
None

## User Acceptance Criteria

```
Scenario: Update a row in the Production.WorkOrder table
Given a row exists in the Production.WorkOrder table with ProductID and OrderQty values
When I update the ProductID or OrderQty in the row
Then a new entry with the updated values should be added to the Production.TransactionHistory table
And the TransactionType should be 'W'
And the TransactionDate should be the current date
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
| sstinsert | NA | NA | [ProductID], [ReferenceOrderID], [TransactionType], [TransactionDate], [Quantity] | NA | NA |  |  |  | [Production].[TransactionHistory] |
| sstselect | [PRODUCTION].[WORKORDER].[ProductID], [PRODUCTION].[WORKORDER].[WorkOrderID], [PRODUCTION].[WORKORDER].[OrderQty] | NA | NA |  |  |  |  |  | inserted |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlrollback |  |  |  |  |  |  |  |  |  |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |

