---
title: "Purchasing.dVendor"
linkTitle: "Purchasing.dVendor"
description: "Purchasing.dVendor"
---

# Triggers

## [Purchasing].[dVendor]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 43
- **Code Complexity:** 4
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Trigger Details

- **Trigger Type**: INSTEAD OF
- **Trigger Table**: [Purchasing].[Vendor]
- **Trigger Events**: [DELETE]

{{< details "Sql Code" >}}
```sql

CREATE TRIGGER [Purchasing].[dVendor] ON [Purchasing].[Vendor] 
INSTEAD OF DELETE NOT FOR REPLICATION AS 
BEGIN
    DECLARE @Count int;

    SET @Count = @@ROWCOUNT;
    IF @Count = 0 
        RETURN;

    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @DeleteCount int;

        SELECT @DeleteCount = COUNT(*) FROM deleted;
        IF @DeleteCount > 0 
        BEGIN
            RAISERROR
                (N'Vendors cannot be deleted. They can only be marked as not active.', -- Message
                10, -- Severity.
                1); -- State.

        -- Rollback any active or uncommittable transactions
            IF @@TRANCOUNT > 0
            BEGIN
                ROLLBACK TRANSACTION;
            END
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

This documentation provides an analysis of a SQL Server Trigger `Purchasing.dVendor` on the `Purchasing.Vendor` table. The trigger prevents the deletion of vendors in the database and ensures that vendors can only be marked as not active.

## Details

The trigger is an INSTEAD OF DELETE trigger, meaning it runs in place of the original DELETE statement. This trigger is not for replication, which means that it will not fire if the trigger is part of a replication process.

## Information on data

The data affected by this trigger resides in the `Purchasing.Vendor` table.

## Information on the tables

1. `Purchasing.Vendor`: This table stores information about the vendors.

## Possible optimization opportunities

No specific optimization opportunities have been identified for this trigger, as it serves a very specific purpose of preventing deletion of vendors.

## Possible bugs

No bugs have been identified at the moment.

## Risk

1. In the case where a query runs without a WHERE clause, the trigger will prevent any vendor from being deleted. This is intended behavior and should be highlighted in the risk section.

## Code Complexity

The trigger code is fairly simple and does not have significant complexity. The main logic resides in checking if there are any records in the deleted table and raising an error if there are.

## Refactoring Opportunities

No significant refactoring opportunities have been identified at the moment, as the trigger code serves a specific purpose and has a straightforward implementation.

## User Acceptance Criteria

```gherkin
Feature: Prevent Vendor Deletion
  Scenario: Attempt to delete a vendor from the database
    Given there is a vendor in the Purchasing.Vendor table
    When a DELETE statement is executed on the Purchasing.Vendor table
    Then the trigger Purchasing.dVendor should prevent the deletion
    And an error message should be raised
```

```gherkin
Feature: Mark Vendor as Inactive
  Scenario: Update a vendor's status to inactive in the database
    Given there is a vendor in the Purchasing.Vendor table
    When an UPDATE statement is executed to mark the vendor as not active
    Then the trigger Purchasing.dVendor should not prevent the update
    And the vendor's status should be updated to inactive
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | DELETED.* | NA | NA |  |  |  |  |  | deleted |

