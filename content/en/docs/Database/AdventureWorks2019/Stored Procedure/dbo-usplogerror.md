---
title: "dbo.uspLogError"
linkTitle: "dbo.uspLogError"
description: "dbo.uspLogError"
---

# Stored Procedures

## [dbo].[uspLogError]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 61
- **Code Complexity:** 3
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @ErrorLogID | INT | OUTPUT |

{{< details "Sql Code" >}}
```sql

-- uspLogError logs error information in the ErrorLog table about the 
-- error that caused execution to jump to the CATCH block of a 
-- TRY...CATCH construct. This should be executed from within the scope 
-- of a CATCH block otherwise it will return without inserting error 
-- information. 
CREATE PROCEDURE [dbo].[uspLogError] 
    @ErrorLogID [int] = 0 OUTPUT -- contains the ErrorLogID of the row inserted
AS                               -- by uspLogError in the ErrorLog table
BEGIN
    SET NOCOUNT ON;

    -- Output parameter value of 0 indicates that error 
    -- information was not logged
    SET @ErrorLogID = 0;

    BEGIN TRY
        -- Return if there is no error information to log
        IF ERROR_NUMBER() IS NULL
            RETURN;

        -- Return if inside an uncommittable transaction.
        -- Data insertion/modification is not allowed when 
        -- a transaction is in an uncommittable state.
        IF XACT_STATE() = -1
        BEGIN
            PRINT 'Cannot log error since the current transaction is in an uncommittable state. ' 
                + 'Rollback the transaction before executing uspLogError in order to successfully log error information.';
            RETURN;
        END

        INSERT [dbo].[ErrorLog] 
            (
            [UserName], 
            [ErrorNumber], 
            [ErrorSeverity], 
            [ErrorState], 
            [ErrorProcedure], 
            [ErrorLine], 
            [ErrorMessage]
            ) 
        VALUES 
            (
            CONVERT(sysname, CURRENT_USER), 
            ERROR_NUMBER(),
            ERROR_SEVERITY(),
            ERROR_STATE(),
            ERROR_PROCEDURE(),
            ERROR_LINE(),
            ERROR_MESSAGE()
            );

        -- Pass back the ErrorLogID of the row inserted
        SET @ErrorLogID = @@IDENTITY;
    END TRY
    BEGIN CATCH
        PRINT 'An error occurred in stored procedure uspLogError: ';
        EXECUTE [dbo].[uspPrintError];
        RETURN -1;
    END CATCH
END;

```
{{< /details >}}
## Overview

The stored procedure `uspLogError` is designed to log error information in the `ErrorLog` table when executed within the scope of a CATCH block. It returns an `ErrorLogID` through its output parameter.

## Details

### Parameters

- `@ErrorLogID int OUTPUT`: The output parameter containing the ErrorLogID of the row inserted by the `uspLogError` stored procedure in the `ErrorLog` table.

### Workflow

1. The procedure checks for the existence of error information. If there's none, it returns without logging.
2. It checks whether the current transaction is in an uncommittable state. If it is, it returns without logging and provides an error message suggesting a rollback.
3. If all conditions are met, the error information gets logged into the `ErrorLog` table.

## Information on Data

The `ErrorLog` table schema:

- `ErrorLogID int PRIMARY KEY`
- `UserName sysname`
- `ErrorNumber int`
- `ErrorSeverity int`
- `ErrorState int`
- `ErrorProcedure nvarchar(126)`
- `ErrorLine int`
- `ErrorMessage nvarchar(4000)`

The `uspLogError` stored procedure inserts a new error log entry with the following values:

- `UserName`: Current user.
- `ErrorNumber`: Error number.
- `ErrorSeverity`: Error severity.
- `ErrorState`: Error state.
- `ErrorProcedure`: Procedure that generated the error.
- `ErrorLine`: Line number of the error.
- `ErrorMessage`: Error message.

## Information on the Tables

`ErrorLog`: Contains the error log entries logged by the `uspLogError` stored procedure with the aforementioned schema.

## Possible Optimization Opportunities

- None identified.

## Possible Bugs

- None identified.

## Risks

- None identified.

## Code Complexity

The code complexity is low as it follows a straightforward algorithm to log error information into the `ErrorLog` table.

## Refactoring Opportunities

- No refactoring opportunities identified.

## User Acceptance Criteria

```gherkin
Feature: Log error information within a CATCH block
  As a database user
  I want to log error information in the ErrorLog table
  So that I can track and debug any errors that occur

  Scenario: Successfully logs error information within a CATCH block
    Given I'm in a CATCH block
    When I call the uspLogError stored procedure
    Then the error information should be inserted into the ErrorLog table
    And the ErrorLogID should be returned as the output parameter

  Scenario: Returns without logging when no error information exists
    Given no error occurred
    When I call the uspLogError stored procedure
    Then the ErrorLog table remains unchanged
    And the ErrorLogID output parameter is 0

  Scenario: Returns without logging when in an uncommittable transaction
    Given the current transaction is uncommittable
    When I call the uspLogError stored procedure
    Then the ErrorLog table remains unchanged
    And the ErrorLogID output parameter is 0
    And an error message suggests to rollback the transaction
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlprint |  |  |  |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |  |  |  |
| sstinsert | NA | NA | [UserName], [ErrorNumber], [ErrorSeverity], [ErrorState], [ErrorProcedure], [ErrorLine], [ErrorMessage] | NA | NA |  |  |  | [dbo].[ErrorLog] |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlprint |  |  |  |  |  |  |  |  |  |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |  |  |  |

