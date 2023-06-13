---
title: "Sales.iduSalesOrderDetail"
linkTitle: "Sales.iduSalesOrderDetail"
description: "Sales.iduSalesOrderDetail"
---

# Triggers

## [Sales].[iduSalesOrderDetail]
### Summary


- **Number of Tables Accessed:** 7
- **Lines of Code:** 84
- **Code Complexity:** 4
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| | [SalesOrderID] | sstselect | JOIN |
| [SALES].[CUSTOMER]| [PersonID] | sstupdate | WHERE |


### Trigger Details

- **Trigger Type**: AFTER
- **Trigger Table**: [Sales].[SalesOrderDetail]
- **Trigger Events**: [INSERT, DELETE, UPDATE]

{{< details "Sql Code" >}}
```sql

CREATE TRIGGER [Sales].[iduSalesOrderDetail] ON [Sales].[SalesOrderDetail] 
AFTER INSERT, DELETE, UPDATE AS 
BEGIN
    DECLARE @Count int;

    SET @Count = @@ROWCOUNT;
    IF @Count = 0 
        RETURN;

    SET NOCOUNT ON;

    BEGIN TRY
        -- If inserting or updating these columns
        IF UPDATE([ProductID]) OR UPDATE([OrderQty]) OR UPDATE([UnitPrice]) OR UPDATE([UnitPriceDiscount]) 
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
                ,inserted.[SalesOrderID]
                ,inserted.[SalesOrderDetailID]
                ,'S'
                ,GETDATE()
                ,inserted.[OrderQty]
                ,inserted.[UnitPrice]
            FROM inserted 
                INNER JOIN [Sales].[SalesOrderHeader] 
                ON inserted.[SalesOrderID] = [Sales].[SalesOrderHeader].[SalesOrderID];

            UPDATE [Person].[Person] 
            SET [Demographics].modify('declare default element namespace 
                "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
                replace value of (/IndividualSurvey/TotalPurchaseYTD)[1] 
                with data(/IndividualSurvey/TotalPurchaseYTD)[1] + sql:column ("inserted.LineTotal")') 
            FROM inserted 
                INNER JOIN [Sales].[SalesOrderHeader] AS SOH
                ON inserted.[SalesOrderID] = SOH.[SalesOrderID] 
                INNER JOIN [Sales].[Customer] AS C
                ON SOH.[CustomerID] = C.[CustomerID]
            WHERE C.[PersonID] = [Person].[Person].[BusinessEntityID];
        END;

        -- Update SubTotal in SalesOrderHeader record. Note that this causes the 
        -- SalesOrderHeader trigger to fire which will update the RevisionNumber.
        UPDATE [Sales].[SalesOrderHeader]
        SET [Sales].[SalesOrderHeader].[SubTotal] = 
            (SELECT SUM([Sales].[SalesOrderDetail].[LineTotal])
                FROM [Sales].[SalesOrderDetail]
                WHERE [Sales].[SalesOrderHeader].[SalesOrderID] = [Sales].[SalesOrderDetail].[SalesOrderID])
        WHERE [Sales].[SalesOrderHeader].[SalesOrderID] IN (SELECT inserted.[SalesOrderID] FROM inserted);

        UPDATE [Person].[Person] 
        SET [Demographics].modify('declare default element namespace 
            "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
            replace value of (/IndividualSurvey/TotalPurchaseYTD)[1] 
            with data(/IndividualSurvey/TotalPurchaseYTD)[1] - sql:column("deleted.LineTotal")') 
        FROM deleted 
            INNER JOIN [Sales].[SalesOrderHeader] 
            ON deleted.[SalesOrderID] = [Sales].[SalesOrderHeader].[SalesOrderID] 
            INNER JOIN [Sales].[Customer]
            ON [Sales].[Customer].[CustomerID] = [Sales].[SalesOrderHeader].[CustomerID]
        WHERE [Sales].[Customer].[PersonID] = [Person].[Person].[BusinessEntityID];
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

The `[Sales].[iduSalesOrderDetail]` trigger performs actions after any `INSERT`, `DELETE`, or `UPDATE` operation on the `[Sales].[SalesOrderDetail]` table. The trigger focuses on updating the corresponding records in various other tables, based on the data manipulation operation.

## Details

### Information on Data

The trigger uses data from the following tables:

1. `[Sales].[SalesOrderDetail]`
2. `[Sales].[SalesOrderHeader]`
3. `[Person].[Person]`
4. `[Sales].[Customer]`
5. `[Production].[TransactionHistory]`

### Information on the Tables

1. `[Sales].[SalesOrderDetail]`: Contains individual sales order items for each sale.
2. `[Sales].[SalesOrderHeader]`: Contains sales order header records, such as sales and customer information.
3. `[Person].[Person]`: Holds personal information of people.
4. `[Sales].[Customer]`: Holds customer information.
5. `[Production].[TransactionHistory]`: Tracks product transactions in the organization.

### Possible Optimization Opportunities

1. If rows are being updated frequently, it may be beneficial to introduce a delay in the trigger execution to process changes in batches.

### Possible Bugs

There are no obvious bugs in the trigger code.

### Risk

The `[Sales].[SalesOrderHeader]` table is updated without a `WHERE` clause, which can cause performance issues, especially if the table has a large number of records.

```sql
UPDATE [Sales].[SalesOrderHeader]
SET [Sales].[SalesOrderHeader].[SubTotal] =
    (SELECT SUM([Sales].[SalesOrderDetail].[LineTotal])
        FROM [Sales].[SalesOrderDetail]
        WHERE [Sales].[SalesOrderHeader].[SalesOrderID] = [Sales].[SalesOrderDetail].[SalesOrderID]);
```

### Code Complexity

The code has a moderate level of complexity due to the various `UPDATE` and `INSERT` statements, and the error handling with `TRY` and `CATCH` blocks.

### Refactoring Opportunities

1. The code can be refactored and optimized by wrapping logic into smaller functions or stored procedures for better readability and maintainability.
2. Create a helper function that updates the `[Sales].[SalesOrderHeader]` table, allowing for better code organization and performance improvement by using a `WHERE` clause.

## User Acceptance Criteria

### Gherkin Scripts for Code Behavior

1. Scenario: SalesOrderDetail row is inserted
   - Given a new row is added to the SalesOrderDetail table
   - When the trigger is executed
   - Then the corresponding records in the TransactionHistory, SalesOrderHeader, and Person tables should be updated accordingly.
   
2. Scenario: SalesOrderDetail row is updated
   - Given an existing row in the SalesOrderDetail table is updated
   - When the trigger is executed
   - Then the corresponding records in the TransactionHistory, SalesOrderHeader, and Person tables should be updated accordingly.
   
3. Scenario: SalesOrderDetail row is deleted
   - Given an existing row in the SalesOrderDetail table is deleted
   - When the trigger is executed
   - Then the corresponding records in the Person table should be updated accordingly.
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| UPDATE | NA | [Sales].[SalesOrderHeader].[SubTotal] | NA |  | [SALES].[SALESORDERHEADER].[SalesOrderID] |  |  |  | [Sales].[SalesOrderHeader] |
| SELECT | [SALES].[SALESORDERDETAIL].[LineTotal] | NA | NA |  | [SALES].[SALESORDERDETAIL].[SalesOrderID], [SALES].[SALESORDERHEADER].[SalesOrderID] |  |  |  | [Sales].[SalesOrderDetail] |
| SELECT | [SALES].[SALESORDERHEADER].[SalesOrderID] | NA | NA |  |  |  |  |  | inserted |
| UPDATE | NA |  | NA |  | [SALES].[CUSTOMER].[PersonID], [PERSON].[PERSON].[BusinessEntityID] |  |  |  | deleted, [Sales].[SalesOrderHeader], [Sales].[Customer], [Person].[Person] |

