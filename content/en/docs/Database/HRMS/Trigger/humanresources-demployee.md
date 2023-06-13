---
title: "HumanResources.dEmployee"
linkTitle: "HumanResources.dEmployee"
description: "HumanResources.dEmployee"
---

# Triggers

## [HumanResources].[dEmployee]
### Summary


- **Number of Tables Accessed:** 0
- **Lines of Code:** 25
- **Code Complexity:** 3
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Trigger Details

- **Trigger Type**: INSTEAD OF
- **Trigger Table**: [HumanResources].[Employee]
- **Trigger Events**: [DELETE]

{{< details "Sql Code" >}}
```sql

CREATE TRIGGER [HumanResources].[dEmployee] ON [HumanResources].[Employee] 
INSTEAD OF DELETE NOT FOR REPLICATION AS 
BEGIN
    DECLARE @Count int;

    SET @Count = @@ROWCOUNT;
    IF @Count = 0 
        RETURN;

    SET NOCOUNT ON;

    BEGIN
        RAISERROR
            (N'Employees cannot be deleted. They can only be marked as not current.', -- Message
            10, -- Severity.
            1); -- State.

        -- Rollback any active or uncommittable transactions
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END
    END;
END;

```
{{< /details >}}
## Overview

This is a markdown documentation of a SQL Server database trigger called `[HumanResources].[dEmployee]`. The trigger is defined on the `[HumanResources].[Employee]` table and is an "INSTEAD OF DELETE" trigger, which means it will execute in place of a delete operation on the table. The main purpose of this trigger is to prevent deletion of employee records by raising an error message and rolling back the transaction if there is one.

## Details

1. The trigger is defined as NOT FOR REPLICATION, which means it won’t be executed during replication events.
2. The trigger checks if there are any rows affected by the DELETE statement.
3. If there are no rows affected, the trigger returns immediately.
4. If there are rows affected, the trigger raises an error, and if there's any active transaction, it rolls back the transaction.

## Information on Data

The trigger is associated with the `[HumanResources].[Employee]` table, which stores employee records.

## Information on the Tables

1. `[HumanResources].[Employee]` table stores employee records

## Possible Optimization Opportunities

There are no apparent optimization opportunities for this trigger as it has a simple and straightforward implementation.

## Possible Bugs

No potential bugs or issues were found in the trigger code.

## Risk

1. DELETE statements executed on the `[HumanResources].[Employee]` table will fail, and it might not be clear to users why their delete operation didn't work.

```sql
DELETE FROM [HumanResources].[Employee] WHERE EmployeeID = 1;
```

This query will raise an error and rollback the transaction (if any), because the trigger prevents the deletion of employees in the table.

## Code Complexity

The code complexity is low. The trigger has a single error-handling structure and a transaction rollback if necessary.

## Refactoring Opportunities

There are no significant refactoring opportunities as the code is simple and readable.

## User Acceptance Criteria

```
Feature: Prevent deletion of employee records
  In order to maintain data integrity
  As a database user
  I want to prevent direct deletion of employee records

Scenario: Attempt to delete an employee record
  Given I execute a DELETE statement on the [HumanResources].[Employee] table
  When the DELETE statement is about to delete an employee record
  Then an error message is raised, notifying me that employees cannot be deleted
  And the transaction is rolled back, if any
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|

