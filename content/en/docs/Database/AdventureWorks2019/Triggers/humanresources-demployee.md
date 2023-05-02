---
title: "HumanResources.dEmployee"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Object Type   |       No of Lines      |  Tables Involed |
|----------|:-------------:|------:|
| Trigger |  700 | Employees, HR |
    

## Overview
This is a documentation of the `dEmployee` trigger found within the `HumanResources` schema and used on the `Employee` table. The trigger prevents deletion of employee records by raising an error message and rolling back the transaction. The trigger is set to execute `INSTEAD OF DELETE` events and is not intended for replication purposes.

## Details

### Information on data

The trigger does not interact with data directly, but it is designed to protect the integrity and prevent the deletion of the employee records in the `Employee` table. Instead of deleting employees directly, they should be marked as not current.

### Information on the tables

- This trigger is applied on the `[HumanResources].[Employee]` table.
- There are no other tables referenced by the trigger.

### Possible optimization opportunities

1. N/A (No optimization needed as this trigger is straightforward and efficient)

### Possible bugs

1. N/A (No bugs identified as this trigger only intends to prevent rows from being deleted)

### Risk

1. Disallowing deletion of employee records might lead to the accumulation of redundant historical data over time. Regular maintenance and archiving should be carried out to improve performance.
2. If any query runs without a proper `WHERE` clause, the risk of unintentional deletion of all records from the Employee table exists. However, this particular trigger prevents deletion of employee records.

### Code Complexity

The code complexity is minimal. It consists of a single trigger definition that:
- Checks the row count of affected rows
- Returns if no rows are affected
- Raises an error and rolls back the transaction if rows are attempted to be deleted

```sql
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

### Refactoring Opportunities

1. No refactoring needed - this code is under the minimum level of complexity and efficiently performs its intended purpose.